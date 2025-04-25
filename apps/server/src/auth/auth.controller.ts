import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { VerifyTfaDto } from "./dto/verify-tfa.dto";
import { FirstLoginChangePasswordDto } from "./dto/first-login-change-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { TempJwtAuthGuard } from "./guards/temp-jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator"; // Custom decorator
import { Public } from "./decorators/public.decorator"; // Decorator for public routes
import { PrismaService, RoleName, User } from "@ezpg/database"; // <-- Import User entity
import { RefreshTokenGuard } from "./guards/refresh-token.guard";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"; // Import Swagger decorators
import { Request, Response } from "express"; // Import express types
import { JwtUser } from "./interfaces/jwt-user.interface";
import { AppConfigService } from "../config/app-config.service"; // Import AppConfigService
import { UserResponseDto } from "./dto/user-response.dto"; // <-- Import the new DTO
import { JwtPayload, TempJwtPayload } from "./interfaces/jwt-payload.interface"; // <-- Import TempJwtPayload
import { JwtService } from "@nestjs/jwt"; // <-- Import JwtService
import { FirstLoginTempGuard } from "./guards/first-login-temp.guard";
import * as bcrypt from "bcrypt";

// Helper function to parse time strings (e.g., "15m", "7d", "30s") into milliseconds
function parseTimeStringToMs(timeString: string): number | undefined {
  if (!timeString) return undefined;
  const match = timeString.match(/^(\d+)([smhd])$/);
  if (!match) return undefined; // Return undefined for invalid format

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return undefined;
  }
}

@ApiTags("Authentication")
@Controller("auth") // Ensure prefix is here if not global
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: AppConfigService, // Inject AppConfigService
    private readonly jwtService: JwtService, // <-- Inject JwtService
    private readonly prisma: PrismaService, // <-- Add PrismaService
  ) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "User Login",
    description:
      "Authenticates a user and returns tokens or indicates TFA requirement.",
  })
  @ApiResponse({
    status: 200,
    description: "Login successful. Returns tokens or TFA requirement.",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. Invalid credentials.",
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request. Missing username or password.",
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request, // Inject Request to get user from validation (needed for userId)
  ) {
    // AuthService.login now only returns flags/tokens, not the user object directly for security
    const loginResult = await this.authService.login(loginDto);

    if (loginResult.tfaRequired) {
      // --- Set Temporary Token Cookie ---
      // We need the userId which AuthService implicitly validated.
      // A more robust way might involve AuthService returning the userId here.
      // Assuming AuthService.login throws if user not found/invalid.
      // Let's try finding the user again here just to get the ID for the temp token.
      // NOTE: This is slightly inefficient. Refactoring AuthService.login to return userId
      // when tfaRequired=true would be better.
      const user = await this.authService.validateUser(
        loginDto.username,
        loginDto.password,
      );
      if (!user) {
        // Should not happen if authService.login succeeded, but defensively check.
        throw new InternalServerErrorException(
          "Failed to retrieve user after login validation.",
        );
      }
      const tempPayload: TempJwtPayload = { userId: user.user_id };
      const secretForSigning = this.configService.jwtTempSecret; // Get secret
      console.log(
        "[AuthController.login] Secret used for SIGNING temp_token:",
        secretForSigning,
      ); // <-- Log the secret
      const tempToken = this.jwtService.sign(tempPayload, {
        secret: secretForSigning, // Use the variable
        expiresIn: this.configService.jwtTempTokenExpirationTime,
      });

      const isProduction = this.configService.nodeEnv !== "development";
      const tempTokenMaxAgeMs = parseTimeStringToMs(
        this.configService.jwtTempTokenExpirationTime,
      );

      res.cookie("temp_token", tempToken, {
        // Use a distinct cookie name
        httpOnly: true,
        path: "/", // Or more specific path if needed
        secure: isProduction,
        sameSite: "lax",
        maxAge: tempTokenMaxAgeMs,
      });
      console.log(
        "[AuthController.login] TFA required, temp_token cookie set.",
      );
      // Return only the flag
      return { tfaRequired: true };
      // ----------------------------------
    } else {
      // Direct Login Success
      if (!loginResult.accessToken || !loginResult.refreshToken) {
        console.error(
          "AuthService.login missing tokens when TFA not required.",
        );
        throw new InternalServerErrorException("Login failed unexpectedly.");
      }

      const isProduction = this.configService.nodeEnv !== "development";

      const accessTokenMaxAgeMs = parseTimeStringToMs(
        this.configService.jwtAccessTokenExpirationTime,
      );
      const refreshTokenMaxAgeMs = parseTimeStringToMs(
        this.configService.jwtRefreshTokenExpirationTime,
      );

      // Set Access Token Cookie
      res.cookie("access_token", loginResult.accessToken, {
        httpOnly: true,
        path: "/",
        secure: isProduction, // Use secure in prod
        sameSite: "lax",
        maxAge: accessTokenMaxAgeMs,
      });

      // Set Refresh Token Cookie
      res.cookie("refresh_token", loginResult.refreshToken, {
        httpOnly: true,
        path: "/api/v1/auth/refresh",
        secure: isProduction,
        sameSite: "lax",
        maxAge: refreshTokenMaxAgeMs,
      });

      // Return user info and flags (tokens are now in cookies)
      return {
        tfaRequired: false,
        firstLogin: loginResult.firstLogin,
        user: loginResult.user,
      };
    }
  }

  @Public()
  @UseGuards(TempJwtAuthGuard)
  @ApiBearerAuth("jwt-temp")
  @Post("verify-tfa")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verify Two-Factor Authentication Code",
    description: "Verifies the TFA code using the temporary token from login.",
  })
  @ApiResponse({
    status: 200,
    description:
      "TFA verification successful. Returns access and refresh tokens or first login token.",
  })
  @ApiResponse({
    status: 401,
    description:
      "Unauthorized. Invalid TFA code or expired/invalid temp token.",
  })
  @ApiResponse({ status: 400, description: "Bad Request. Missing TFA code." })
  async verifyTfa(
    @CurrentUser("userId") userId: string,
    @Body() verifyTfaDto: VerifyTfaDto,
    @Res({ passthrough: true }) res: Response, // Inject Response
  ) {
    // Service now returns tokens and user info upon successful verification
    const verificationResult = await this.authService.verifyTfa(
      userId,
      verifyTfaDto,
    );

    const isProduction = this.configService.nodeEnv !== "development";

    // Clear the temporary token cookie upon successful TFA verification
    res.clearCookie("temp_token", {
      httpOnly: true,
      path: "/",
      secure: isProduction,
      sameSite: "lax",
    });
    console.log("[AuthController.verifyTfa] Cleared temp_token cookie.");

    if (verificationResult.firstLogin) {
      // Set first login token cookie for password change
      const firstLoginTokenMaxAgeMs = parseTimeStringToMs(
        this.configService.jwtFirstLoginTokenExpirationTime,
      );

      res.cookie("first_login_token", verificationResult.firstLoginToken, {
        httpOnly: true,
        path: "/",
        secure: isProduction,
        sameSite: "lax",
        maxAge: firstLoginTokenMaxAgeMs,
      });
      console.log(
        "[AuthController.verifyTfa] Set first_login_token cookie for password change.",
      );

      // Return first login state and user
      return {
        firstLogin: true,
        user: verificationResult.user,
      };
    } else {
      // Regular login - set access and refresh token cookies
      const accessTokenMaxAgeMs = parseTimeStringToMs(
        this.configService.jwtAccessTokenExpirationTime,
      );
      const refreshTokenMaxAgeMs = parseTimeStringToMs(
        this.configService.jwtRefreshTokenExpirationTime,
      );

      // Set Access Token Cookie
      res.cookie("access_token", verificationResult.accessToken, {
        httpOnly: true,
        path: "/",
        secure: isProduction,
        sameSite: "lax",
        maxAge: accessTokenMaxAgeMs,
      });

      // Set Refresh Token Cookie
      res.cookie("refresh_token", verificationResult.refreshToken, {
        httpOnly: true,
        path: "/api/v1/auth/refresh",
        secure: isProduction,
        sameSite: "lax",
        maxAge: refreshTokenMaxAgeMs,
      });

      // Return user info and flags
      return {
        firstLogin: false,
        user: verificationResult.user,
      };
    }
  }

  @Public()
  @UseGuards(FirstLoginTempGuard)
  @ApiBearerAuth()
  @Put("set-password-first-login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Set Password After First Login",
    description:
      "Sets the user's permanent password after their initial login using a temporary one.",
  })
  @ApiResponse({
    status: 200,
    description: "Password set successfully.",
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. Invalid or expired first login token.",
  })
  @ApiResponse({
    status: 400,
    description:
      "Bad Request. Invalid new password or user not in first_login state.",
  })
  async setPasswordFirstLogin(
    @CurrentUser("userId") userId: string,
    @Body() firstLoginDto: FirstLoginChangePasswordDto,
    @Res({ passthrough: true }) res: Response, // Add response for cookie handling
  ): Promise<UserResponseDto> {
    const serviceResult = await this.authService.setPasswordFirstLogin(
      userId,
      firstLoginDto,
    );

    // Explicitly cast to User type that should include relations
    const updatedUser = serviceResult as User & {
      role: { role_name: RoleName };
    };

    // After successfully changing password, generate tokens directly
    const jwtPayload: JwtPayload = {
      userId: updatedUser.user_id,
      role: updatedUser.role.role_name,
      tfaVerified: true, // User has completed both TFA and password change
    };

    // Generate access token
    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.jwtSecret,
      expiresIn: this.configService.jwtAccessTokenExpirationTime,
    });

    // Generate refresh token
    const refreshTokenPayload = {
      userId: updatedUser.user_id,
      role: updatedUser.role.role_name,
    };

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.jwtRefreshTokenSecret,
      expiresIn: this.configService.jwtRefreshTokenExpirationTime,
    });

    // Store refresh token hash
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    await this.prisma.user.update({
      where: { user_id: userId },
      data: { hashed_refresh_token: hashedRefreshToken },
    });

    const isProduction = this.configService.nodeEnv !== "development";

    // Clear the first login token cookie
    res.clearCookie("first_login_token", {
      httpOnly: true,
      path: "/",
      secure: isProduction,
      sameSite: "lax",
    });

    // Set regular access and refresh token cookies
    const accessTokenMaxAgeMs = parseTimeStringToMs(
      this.configService.jwtAccessTokenExpirationTime,
    );
    const refreshTokenMaxAgeMs = parseTimeStringToMs(
      this.configService.jwtRefreshTokenExpirationTime,
    );

    // Set Access Token Cookie
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      path: "/",
      secure: isProduction,
      sameSite: "lax",
      maxAge: accessTokenMaxAgeMs,
    });

    // Set Refresh Token Cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      path: "/api/v1/auth/refresh",
      secure: isProduction,
      sameSite: "lax",
      maxAge: refreshTokenMaxAgeMs,
    });

    // Manually construct the DTO to ensure correct shape and exclude sensitive fields
    const result: UserResponseDto = {
      userId: updatedUser.user_id,
      username: updatedUser.username,
      isActive: updatedUser.is_active,
      firstLogin: updatedUser.first_login, // This should now be false
      tfaEnabled: !!updatedUser.tfa_secret,
      roleName: updatedUser.role.role_name, // Access role_name from included relation
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    };
    return result;
  }

  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth("jwt-refresh")
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh Access Token",
    description: "Issues a new access token using a valid refresh token.",
  })
  @ApiResponse({
    status: 200,
    description: "Access token refreshed successfully.",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. Invalid or expired refresh token.",
  })
  async refreshTokens(
    @CurrentUser() user: { userId: string; role: RoleName },
    @Res({ passthrough: true }) res: Response, // Inject Response
  ) {
    // Service returns only the new access token
    const { accessToken } = await this.authService.refreshToken(
      user.userId,
      user.role,
    );

    const isProduction = this.configService.nodeEnv !== "development";

    const accessTokenMaxAgeMs = parseTimeStringToMs(
      this.configService.jwtAccessTokenExpirationTime,
    );

    // Set ONLY the new access token cookie
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      path: "/",
      secure: isProduction,
      sameSite: "lax",
      maxAge: accessTokenMaxAgeMs,
    });

    // Return empty or success message, token is in cookie
    return { message: "Token refreshed" };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "User Logout",
    description:
      "Invalidates the user's current refresh token server-side and clears auth cookies.",
  })
  @ApiResponse({ status: 200, description: "Logout successful." })
  @ApiResponse({
    status: 401,
    description: "Unauthorized. Invalid or expired access token.",
  })
  async logout(
    @CurrentUser("userId") userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    // Ensure paths match where cookies were set
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/api/v1/auth/refresh" });
    res.clearCookie("temp_token", { path: "/" });
    // Keep clearing CSRF token cookie if needed
    res.clearCookie("_csrf", { httpOnly: true }); // Default name for csurf cookie
    return { message: "Logout successful." };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("profile")
  @ApiOperation({
    summary: "Get Current User Profile",
    description:
      "Retrieves basic profile information for the authenticated user.",
  })
  @ApiResponse({ status: 200, description: "User profile retrieved." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  getProfile(@CurrentUser() user: JwtUser) {
    console.log("[AuthController.getProfile] Returning profile:", user);
    return user;
  }

  @Public()
  @Get("csrf-token")
  @ApiOperation({
    summary: "Get CSRF Token",
    description:
      "Provides a CSRF token needed for subsequent state-changing requests.",
  })
  @ApiResponse({
    status: 200,
    description: "CSRF token provided successfully.",
    schema: { example: { csrfToken: "string" } },
  })
  getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.csrfToken();
    console.log("Generated CSRF Token for request:", token);
    res.json({ csrfToken: token });
  }
}
