import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService, RoleName, User } from "@ezpg/database";
import { LoginDto } from "./dto/login.dto";
import { VerifyTfaDto } from "./dto/verify-tfa.dto";
import { FirstLoginChangePasswordDto } from "./dto/first-login-change-password.dto";
import {
  FirstLoginTempPayload,
  JwtPayload,
  RefreshTokenPayload,
  TempJwtPayload,
} from "./interfaces/jwt-payload.interface";
import { EncryptionService } from "../core/encryption/encryption.service";
import { base32Decode, validateTOTP } from "@ezpg/helpers";
import { AppConfigService } from "../config/app-config.service";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: AppConfigService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<
    User,
    "password_hash" | "tfa_secret" | "deleted_at" | "hashed_refresh_token"
  > | null> {
    console.log(
      `[AuthService.validateUser] Attempting to validate user: ${username}`,
    );
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (user) {
      console.log(
        `[AuthService.validateUser] Found user ${username}, active: ${user.is_active}`,
      );
      console.log(
        `[AuthService.validateUser] Stored hash: ${user.password_hash}`,
      );
      console.log(`[AuthService.validateUser] Provided password: ${pass}`);
      const isPasswordMatch = await bcrypt.compare(pass, user.password_hash);
      console.log(
        `[AuthService.validateUser] bcrypt.compare result: ${isPasswordMatch}`,
      );

      if (user.is_active && isPasswordMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
          password_hash,
          tfa_secret,
          deleted_at,
          hashed_refresh_token,
          ...result
        } = user;
        return result;
      }
    }
    return null;
  }

  async validateUserByIdForJwt(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { user_id: userId, is_active: true },
      include: { role: true },
    });
  }

  // --- ADDED: Validate user and refresh token hash ---
  async validateUserForRefreshToken(
    userId: string,
    providedRefreshToken: string,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId, is_active: true, deleted_at: null },
      include: { role: true }, // Include role if needed
    });

    if (!user || !user.hashed_refresh_token) {
      return null; // User not found, inactive, or no refresh token stored
    }

    // Compare provided token with stored hash
    const isRefreshTokenMatching = await bcrypt.compare(
      providedRefreshToken,
      user.hashed_refresh_token,
    );

    if (!isRefreshTokenMatching) {
      return null; // Token doesn't match
    }

    return user; // Validation successful
  }

  async login(loginDto: LoginDto): Promise<{
    tfaRequired: boolean;
    accessToken?: string;
    refreshToken?: string;
    firstLogin?: boolean;
    tempToken?: string;
    user?: UserResponseDto;
  }> {
    const { username, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    // --- ADD LOGS FOR DEBUGGING ---
    console.log(`[AuthService.login] Attempting login for user: ${username}`);
    if (user) {
      console.log(
        `[AuthService.login] Found user ${username}, active: ${user.is_active}`,
      );
      console.log(`[AuthService.login] Stored hash: ${user.password_hash}`);
      console.log(`[AuthService.login] Provided password: ${password}`);
      const isPasswordMatch = await bcrypt.compare(
        password,
        user.password_hash,
      );
      console.log(
        `[AuthService.login] bcrypt.compare result: ${isPasswordMatch}`,
      );
    } else {
      console.log(`[AuthService.login] User ${username} not found.`);
    }
    // --- END LOGS ---

    if (
      !user ||
      !user.is_active ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      throw new UnauthorizedException("Invalid credentials or inactive user.");
    }

    if (user.tfa_secret) {
      // --- MODIFIED: Generate and return temp token ---
      const tempPayload: TempJwtPayload = { userId: user.user_id };
      const tempToken = await this.jwtService.signAsync(tempPayload, {
        secret: this.configService.jwtTempSecret, // Use the temp secret
        expiresIn: this.configService.jwtTempTokenExpirationTime, // Use temp expiry
      });
      console.log(
        `[AuthService.login] TFA required for user ${user.user_id}. Generated temp token.`,
      );
      return { tfaRequired: true, tempToken }; // Return temp token
      // --- END MODIFICATION ---
    } else {
      // No TFA: Issue regular token pair
      const payload: JwtPayload = {
        userId: user.user_id,
        role: user.role.role_name,
        tfaVerified: false,
      };
      const tokens = await this.generateTokens(payload);

      // Store the hash of the new refresh token
      await this.updateRefreshTokenHash(user.user_id, tokens.refreshToken);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        password_hash,
        tfa_secret,
        deleted_at,
        hashed_refresh_token,
        role_id,
        ...userInfo
      } = user;

      // Create a properly typed UserResponseDto
      const userResponse: UserResponseDto = {
        userId: user.user_id,
        username: user.username,
        isActive: user.is_active,
        firstLogin: user.first_login,
        tfaEnabled: !!user.tfa_secret,
        roleName: user.role.role_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };

      return {
        tfaRequired: false,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken, // Send refresh token in response body (or set HttpOnly cookie)
        firstLogin: user.first_login,
        user: userResponse,
      };
    }
  }

  async verifyTfa(
    userId: string,
    verifyTfaDto: VerifyTfaDto,
  ): Promise<{
    accessToken?: string;
    refreshToken?: string;
    firstLoginToken?: string;
    firstLogin: boolean;
    user: UserResponseDto;
  }> {
    console.log(
      `[AuthService.verifyTfa] Verifying TFA for user ${userId} with code ${verifyTfaDto.tfaCode}`,
    );
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId, is_active: true },
      include: { role: true },
    });

    if (!user || !user.tfa_secret) {
      console.error(
        `[AuthService.verifyTfa] User ${userId} not found or TFA secret missing.`,
      );
      throw new UnauthorizedException("Invalid user or TFA not configured.");
    }

    let decryptedSecretBase32: string;
    try {
      // Decrypt the stored base32 secret string
      const decrypted = this.encryptionService.decrypt(user.tfa_secret);
      if (!decrypted) {
        throw new Error("Decryption returned null");
      }
      decryptedSecretBase32 = decrypted;
    } catch (error) {
      console.error(
        `[AuthService.verifyTfa] Failed to decrypt TFA secret for user ${userId}:`,
        error,
      );
      throw new InternalServerErrorException("TFA secret decryption failed.");
    }

    let secretBuffer: Buffer;
    try {
      // Decode the base32 secret string into a Buffer
      secretBuffer = base32Decode(decryptedSecretBase32);
    } catch (error) {
      console.error(
        `[AuthService.verifyTfa] Failed to decode base32 secret for user ${userId}: ${decryptedSecretBase32.substring(0, 5)}...`,
        error,
      );
      throw new InternalServerErrorException(
        "Invalid TFA secret format after decryption.",
      );
    }

    // Validate the token using the helper
    const isValid = validateTOTP(verifyTfaDto.tfaCode, secretBuffer);

    if (!isValid) {
      console.warn(
        `[AuthService.verifyTfa] Invalid TFA code provided by user ${userId}.`,
      );
      throw new UnauthorizedException("Invalid TFA code.");
    }

    // --- TFA SUCCESS ---
    console.log(
      `[AuthService.verifyTfa] TFA verified successfully for user ${userId}.`,
    );

    // Create a properly typed UserResponseDto
    const userResponse: UserResponseDto = {
      userId: user.user_id,
      username: user.username,
      isActive: user.is_active,
      firstLogin: user.first_login,
      tfaEnabled: !!user.tfa_secret,
      roleName: user.role.role_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    // Check if this is a first login scenario
    if (user.first_login) {
      // Generate first login token (with limited permissions)
      const firstLoginPayload: FirstLoginTempPayload = {
        userId: user.user_id,
        firstLoginPasswordChange: true,
      };

      const firstLoginToken = this.jwtService.sign(firstLoginPayload, {
        secret: this.configService.jwtFirstLoginSecret,
        expiresIn: this.configService.jwtFirstLoginTokenExpirationTime,
      });

      console.log(
        `[AuthService.verifyTfa] First login detected, generated first login token for user ${userId}.`,
      );

      // Update user's last login time
      await this.prisma.user.update({
        where: { user_id: userId },
        data: {
          last_login_at: new Date(),
        },
      });

      return {
        firstLoginToken,
        firstLogin: true,
        user: userResponse,
      };
    } else {
      // Regular user, generate full access tokens
      const payload: JwtPayload = {
        userId: user.user_id,
        role: user.role.role_name,
        tfaVerified: true,
      };
      const tokens = await this.generateTokens(payload);

      // Store the hash of the new refresh token
      await this.updateRefreshTokenHash(user.user_id, tokens.refreshToken);

      // Update user's last login time
      await this.prisma.user.update({
        where: { user_id: userId },
        data: {
          last_login_at: new Date(),
        },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        firstLogin: false,
        user: userResponse,
      };
    }
  }

  // --- NEW: For FIRST LOGIN password changes ---
  async setPasswordFirstLogin(
    userId: string,
    firstLoginDto: FirstLoginChangePasswordDto,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: { role: true },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException("User not found or inactive.");
    }

    // Ensure this is only used during first login
    if (!user.first_login) {
      throw new BadRequestException("This flow is only for first login.");
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(firstLoginDto.newPassword, 10);

    // Update password and clear the first_login flag
    const updatedUser = await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        password_hash: newPasswordHash,
        first_login: false,
      },
    });

    // Re-fetch the user with the role included after update to return it
    const updatedUserWithRole = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: { role: true },
    });

    if (!updatedUserWithRole) {
      // This should ideally not happen if the update succeeded
      throw new InternalServerErrorException(
        "Failed to fetch user after update.",
      );
    }

    console.log(
      `[AuthService.setPasswordFirstLogin] Updated password and first_login flag for user ${userId}`,
    );
    return updatedUserWithRole;
  }

  // --- ADDED: Refresh Tokens ---
  async refreshToken(
    userId: string,
    userRole: RoleName,
  ): Promise<{ accessToken: string }> {
    // User is already validated by RefreshTokenStrategy
    // We just need to issue a new access token
    const payload: JwtPayload = { userId, role: userRole, tfaVerified: true }; // Assume TFA verified if refreshing
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.jwtSecret,
      expiresIn: this.configService.jwtAccessTokenExpirationTime,
    });
    // Note: We typically DO NOT issue a new refresh token here unless the old one is compromised or nearing expiry.
    // Keep the existing refresh token valid until its original expiry or logout.
    return { accessToken };
  }

  // --- ADDED: Logout ---
  async logout(userId: string): Promise<void> {
    // Invalidate the refresh token by clearing the stored hash
    try {
      await this.prisma.user.update({
        where: { user_id: userId },
        data: { hashed_refresh_token: null },
      });
    } catch (error) {
      // Handle errors
      console.error(`Error clearing refresh token during logout:`, error);
    }
  }

  // --- Helper to generate token pairs ---
  private async generateTokens(
    payload: JwtPayload | RefreshTokenPayload,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Ensure payload has necessary fields for both tokens
    const accessPayload: JwtPayload = {
      userId: payload.userId,
      role: payload.role,
      tfaVerified: "tfaVerified" in payload ? payload.tfaVerified : true, // Assume TFA verified if refreshing/logging in without TFA step
    };
    const refreshPayload: RefreshTokenPayload = {
      userId: payload.userId,
      role: payload.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.jwtSecret,
        expiresIn: this.configService.jwtAccessTokenExpirationTime,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.jwtRefreshTokenSecret,
        expiresIn: this.configService.jwtRefreshTokenExpirationTime,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  // --- Helper to hash and store refresh token ---
  private async updateRefreshTokenHash(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;
    await this.prisma.user.update({
      where: { user_id: userId },
      data: { hashed_refresh_token: hashedRefreshToken },
    });
  }
}
