import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AdminUsersService } from "./admin-users.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtUser } from "src/auth/interfaces/jwt-user.interface";
import { TfaResetResponseDto } from "./dto/tfa-reset-response.dto";
import { UpdateMerchantStatusDto } from "./dto/update-merchant-status.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { EnableTfaDto } from "./dto/enable-tfa.dto";
import { TfaSetupResponseDto } from "./dto/tfa-setup-response.dto";
import { AdminUserResponseDto } from "./dto/admin-user-response.dto";

@ApiTags("Admin - User Management")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/users")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  /**
   * Resets TFA for a user
   * Only the admin who created the user or a superadmin can reset their TFA
   *
   * @param userId - The unique ID of the user
   * @param adminUser - The authenticated admin user
   */
  @Post(":userId/reset-tfa")
  @ApiOperation({ summary: "Reset TFA for a user" })
  @ApiParam({
    name: "userId",
    description: "User ID to reset TFA for",
    example: "US000001",
  })
  @ApiResponse({
    status: 200,
    description: "TFA reset successfully",
    type: TfaResetResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Insufficient permissions.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  async resetTfa(
    @Param("userId") userId: string,
    @CurrentUser() adminUser: JwtUser,
  ): Promise<TfaResetResponseDto> {
    return this.adminUsersService.resetTfaSecret(userId, adminUser.userId);
  }

  /**
   * Updates a merchant's status
   * Only the admin who created the merchant or a superadmin can update the status
   *
   * @param merchantId - The unique ID of the merchant
   * @param updateStatusDto - The status update data
   * @param user - The authenticated admin user
   * @returns Updated user information
   */
  @Patch("merchants/:merchantId/status")
  @ApiOperation({
    summary: "Update Merchant Status",
    description: "Updates the status for a specific merchant.",
  })
  @ApiParam({
    name: "merchantId",
    description: "The unique VARCHAR(8) ID of the merchant",
    example: "sticpay",
  })
  @ApiBody({ type: UpdateMerchantStatusDto })
  @ApiResponse({
    status: 200,
    description: "Merchant status updated successfully.",
    type: AdminUserResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Insufficient permissions.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  async updateMerchantStatus(
    @Param("merchantId") merchantId: string,
    @Body() updateStatusDto: UpdateMerchantStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.adminUsersService.updateUserRoleStatus(
      merchantId,
      updateStatusDto.isActive,
      user,
    );
  }

  /**
   * Updates a user's password
   *
   * @param userId - The unique ID of the user
   * @param updatePasswordDto - DTO containing the new password
   * @param adminUser - The authenticated admin user
   * @returns Successful update message
   */
  @Patch(":userId/password")
  @ApiOperation({
    summary: "Update User Password",
    description: "Updates the password for any user in the system.",
  })
  @ApiParam({
    name: "userId",
    description: "The unique ID of the user",
    example: "US000001",
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 200,
    description: "Password updated successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Insufficient permissions.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  async updatePassword(
    @Param("userId") userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() adminUser: JwtUser,
  ) {
    await this.adminUsersService.updatePassword(
      userId,
      { newPassword: updatePasswordDto.newPassword },
      adminUser.userId,
    );

    return { message: "Password updated successfully" };
  }

  /**
   * Generates and stores a TFA secret for a user
   *
   * @param userId - The unique ID of the user
   * @param adminUser - The authenticated admin user
   * @returns TFA setup information including QR code
   */
  @Post(":userId/generate-tfa")
  @ApiOperation({
    summary: "Generate TFA Setup",
    description:
      "Generates and stores a TFA secret for a user, returning QR code setup information.",
  })
  @ApiParam({
    name: "userId",
    description: "The unique ID of the user",
    example: "US000001",
  })
  @ApiResponse({
    status: 200,
    description: "TFA setup generated successfully.",
    type: TfaSetupResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Insufficient permissions.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  async generateTfaSetup(
    @Param("userId") userId: string,
    @CurrentUser() adminUser: JwtUser,
  ): Promise<TfaSetupResponseDto> {
    return this.adminUsersService.generateAndStoreTfaSecret(userId, adminUser);
  }

  /**
   * Enables TFA for a user
   *
   * @param userId - The unique ID of the user
   * @param enableTfaDto - DTO containing the TFA secret
   * @param adminUser - The authenticated admin user
   * @returns Updated user information
   */
  @Post(":userId/enable-tfa")
  @ApiOperation({
    summary: "Enable TFA",
    description:
      "Enables TFA for a user by verifying and storing their secret.",
  })
  @ApiParam({
    name: "userId",
    description: "The unique ID of the user",
    example: "US000001",
  })
  @ApiBody({ type: EnableTfaDto })
  @ApiResponse({
    status: 200,
    description: "TFA enabled successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Insufficient permissions.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  async enableTfa(
    @Param("userId") userId: string,
    @Body() enableTfaDto: EnableTfaDto,
    @CurrentUser() adminUser: JwtUser,
  ) {
    await this.adminUsersService.enableTfa(
      userId,
      { secret: enableTfaDto.secret },
      adminUser.userId,
    );
    return { message: "TFA enabled successfully" };
  }

  /**
   * Disables TFA for a user
   *
   * @param userId - The unique ID of the user
   * @param adminUser - The authenticated admin user
   * @returns Updated user information
   */
  @Post(":userId/disable-tfa")
  @ApiOperation({
    summary: "Disable TFA",
    description: "Disables TFA for a user.",
  })
  @ApiParam({
    name: "userId",
    description: "The unique ID of the user",
    example: "US000001",
  })
  @ApiResponse({
    status: 200,
    description: "TFA disabled successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Insufficient permissions.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  async disableTfa(
    @Param("userId") userId: string,
    @CurrentUser() adminUser: JwtUser,
  ) {
    await this.adminUsersService.disableTfa(userId, adminUser.userId);
    return { message: "TFA disabled successfully" };
  }
}
