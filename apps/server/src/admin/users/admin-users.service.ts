import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
// import { CreateAdminDto } from "./dto/create-admin.dto";
// import { UpdateAdminDto } from "./dto/update-admin.dto";
// import { AdminQueryDto } from "./dto/admin-query.dto";
import {
  EntityType,
  LogSeverity,
  Prisma,
  PrismaService,
  RoleName,
  User,
} from "@ezpg/database";
// import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { LoggingService } from "../../core/logging/logging.service";
import { JwtUser } from "src/auth/interfaces/jwt-user.interface";
import { LogAction } from "../../core/logging/log-action.enum";
import { TfaResetResponseDto } from "./dto/tfa-reset-response.dto";
import { IdGeneratorService } from "../../core/id-generator/id-generator.service";
import * as bcrypt from "bcrypt";
import { EncryptionService } from "../../core/encryption/encryption.service";
import {
  generateOtpAuthUri,
  generateTotpQrCodeDataUri,
  generateTotpSecret,
  validateTOTP,
} from "@ezpg/helpers";
import { AppConfigService } from "../../config/app-config.service";

/**
 * Parameters for creating a user
 */
interface CreateUserParams {
  userId?: string; // Optional, auto-generated if not provided
  username: string;
  password: string;
  roleId?: number;
  roleName?: RoleName;
  tfaEnabled?: boolean;
  isActive?: boolean;
  firstLogin?: boolean;
}

/**
 * General service for user management across different roles
 * Provides common methods for querying and updating users
 * Role-specific services should inject this for role-agnostic operations
 */
@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggingService,
    private readonly idGeneratorService: IdGeneratorService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * Checks if a username already exists in the system
   * This is a common operation used by all role services when creating users
   *
   * @param username The username to check
   * @throws ConflictException if the username already exists
   */
  async checkUsernameExists(username: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException(`Username '${username}' already exists.`);
    }
  }

  /**
   * Centralized method to create a user with optional TFA setup
   * and the corresponding entity record based on role
   *
   * @param params Parameters for user creation
   * @param generateTfa Whether to generate TFA secret and QR code
   * @returns Created user and optional TFA information
   */
  async createUser(
    params: CreateUserParams,
    generateTfa: boolean = false,
  ): Promise<{
    user: User;
    tfa?: {
      secret: string;
      otpAuthUrl: string;
      qrCodeUrl: string;
      qrCodeBase64: string;
    };
  }> {
    const {
      userId,
      username,
      password,
      roleName,
      roleId,
      tfaEnabled = false,
      isActive = true,
      firstLogin = true,
    } = params;

    // Check if username already exists
    await this.checkUsernameExists(username);

    // Ensure we have a role
    if (!roleName && !roleId) {
      throw new Error("Either roleName or roleId must be provided");
    }

    // Get role name if only roleId was provided
    let actualRoleName = roleName;
    if (!actualRoleName && roleId) {
      const role = await this.prisma.role.findUnique({
        where: { role_id: roleId },
      });
      if (!role) throw new Error(`Role with ID ${roleId} not found`);
      actualRoleName = role.role_name;
    }

    // Generate ID if not provided
    const userIdToUse =
      userId ||
      (actualRoleName ? await this.generateUserIdByRole(actualRoleName) : null);
    if (!userIdToUse) {
      throw new Error("Could not determine a user ID");
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare role connection based on what was provided
    let roleData: Prisma.RoleCreateNestedOneWithoutUsersInput | undefined;

    if (roleName) {
      roleData = {
        connect: { role_name: roleName },
      };
    } else if (roleId) {
      roleData = {
        connect: { role_id: roleId },
      };
    }

    try {
      // If TFA is enabled, generate a secret first
      let tfaInfo = null;

      // Create the user first
      const user = await this.prisma.user.create({
        data: {
          user_id: userIdToUse,
          username,
          password_hash: hashedPassword,
          role: roleData,
          first_login: firstLogin,
          is_active: isActive,
        },
      });

      // If TFA is enabled, generate and store a secret
      if (tfaEnabled) {
        tfaInfo = await this.generateAndStoreTfaSecret(user.user_id, {
          userId: "SYSTEM",
        } as JwtUser);
      }

      return { user, tfa: tfaInfo };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002 is the Prisma error code for unique constraint violations
        if (error.code === "P2002") {
          throw new ConflictException(
            `User creation failed: A user with this ${error.meta?.target || "identifier"} already exists`,
          );
        }
      }
      this.logger.standardError(
        `Failed to create user: ${(error as Error).message}`,
        (error as Error).stack,
        "AdminUsersService",
      );
      throw new InternalServerErrorException("Failed to create user");
    }
  }

  /**
   * Finds a user by their ID
   * @param userId The ID of the user to find
   * @returns The user if found, or null if not found
   */
  async findOne(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * Finds a user by their username
   * @param username The username of the user to find
   * @returns The user if found, or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });
  }

  /**
   * Updates a user's password with admin authorization
   *
   * @param userId User ID
   * @param dto DTO containing the new password
   * @param adminUserId Admin user ID performing the update
   * @returns Updated user without sensitive data
   */
  async updatePassword(
    userId: string,
    dto: { newPassword: string },
    adminUserId: string,
  ): Promise<
    Omit<
      User,
      "password_hash" | "tfa_secret" | "deleted_at" | "hashed_refresh_token"
    >
  > {
    // Find the user to check permissions
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        role: true,
        admin: true,
        merchant: { select: { created_by: true } },
        agent: {
          include: {
            merchant: { select: { created_by: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if admin is authorized
    const isSuperAdmin = await this.isSuperAdmin(adminUserId);

    // Only allow if superadmin or the admin created this merchant/agent
    if (!isSuperAdmin) {
      const roleName = user.role?.role_name;

      if (roleName === RoleName.MERCHANT) {
        if (!user.merchant || user.merchant.created_by !== adminUserId) {
          throw new ForbiddenException(
            "You are not authorized to update this merchant's password",
          );
        }
      } else if (roleName === RoleName.AGENT) {
        if (
          !user.agent ||
          !user.agent.merchant ||
          user.agent.merchant.created_by !== adminUserId
        ) {
          throw new ForbiddenException(
            "You are not authorized to update this agent's password",
          );
        }
      }
      // else if (roleName === RoleName.ADMIN && user.role?.role_name) {
      //   throw new ForbiddenException(
      //     "Only superadmins can update other admin accounts' passwords",
      //   );
      // }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update with new password
    const updatedUser = await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        password_hash: hashedPassword,
        first_login: false, // Reset first login flag
      },
    });

    // Log the action
    let entityType: EntityType = "MERCHANT";
    if (user.role?.role_name === RoleName.AGENT) {
      entityType = "AGENT";
    } else if (user.role?.role_name === RoleName.ADMIN) {
      entityType = "ADMIN";
    }

    await this.logger.logUserAction(
      { userId: adminUserId } as JwtUser,
      LogAction.PASSWORD_CHANGED,
      LogSeverity.INFO,
      entityType,
      userId,
      { userId, updatedBy: adminUserId },
    );

    // Return sanitized user
    const {
      password_hash,
      tfa_secret,
      deleted_at,
      hashed_refresh_token,
      ...safeUser
    } = updatedUser;
    return safeUser;
  }

  /**
   * Validates a plaintext password against a user's hashed password
   * @param user User object with password_hash
   * @param password Plaintext password to validate
   * @returns Whether the password is valid
   */
  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  /**
   * Generates a TFA secret and immediately stores it in the user record
   *
   * @param userId User ID to generate and store the secret for
   * @param adminUser Admin user performing the operation
   * @returns Object containing the secret, URLs, and base64 QR code
   */
  async generateAndStoreTfaSecret(
    userId: string,
    adminUser?: JwtUser,
  ): Promise<{
    secret: string;
    otpAuthUrl: string;
    qrCodeUrl: string;
    qrCodeBase64: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Generate a new secret
    const { base32: secretBase32 } = generateTotpSecret();

    // Generate OTP Auth URI for QR code
    const otpAuthUrl = generateOtpAuthUri(
      user.username,
      secretBase32,
      this.configService.appName,
    );

    // Generate QR code as data URL (base64)
    const qrCodeUrl = await generateTotpQrCodeDataUri(otpAuthUrl);

    // Extract the base64 part of the data URL (removing the prefix)
    const qrCodeBase64 = qrCodeUrl.split(",")[1] || "";

    // Encrypt the secret before storing it
    const encryptedSecret = this.encryptionService.encrypt(secretBase32);

    if (!encryptedSecret) {
      throw new InternalServerErrorException("Failed to encrypt TFA secret");
    }

    // Store the encrypted secret in the database
    await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        tfa_secret: encryptedSecret,
      },
    });

    return {
      secret: secretBase32,
      otpAuthUrl,
      qrCodeUrl,
      qrCodeBase64,
    };
  }

  /**
   * Check if a user is a super admin by directly querying the admin table
   *
   * @param userId User ID to check
   * @returns True if user is a super admin
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { admin_id: userId },
        select: { is_super: true },
      });

      return admin?.is_super || false;
    } catch (error) {
      this.logger.standardError(
        `Failed to check superadmin status: ${(error as Error).message}`,
        (error as Error).stack,
        "AdminUsersService",
      );
      // Default to false on error for security reasons
      return false;
    }
  }

  /**
   * Reset the TFA secret for a user, replacing any existing one
   *
   * @param userId User ID to reset TFA for
   * @param adminUserId ID of the admin performing the reset
   * @returns Object containing the new TFA secret and QR code
   */
  async resetTfaSecret(
    userId: string,
    adminUserId: string,
  ): Promise<TfaResetResponseDto> {
    // Find user with role info for authorization check
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        role: true,
        merchant: { select: { created_by: true } },
        agent: {
          include: {
            merchant: { select: { created_by: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.deleted_at) {
      throw new BadRequestException(
        `Cannot reset TFA for deleted user with ID ${userId}`,
      );
    }

    if (!user.is_active) {
      throw new BadRequestException(
        `Cannot reset TFA for inactive user with ID ${userId}`,
      );
    }

    // Check if the admin user is a superadmin
    const isSuperAdmin = await this.isSuperAdmin(adminUserId);

    // For superadmins, authorize all TFA resets
    if (isSuperAdmin) {
      const tfaInfo = await this.generateAndStoreTfaSecret(userId, {
        userId: adminUserId,
      } as JwtUser);

      // Determine entity type based on user role
      let entityType: EntityType = "MERCHANT";
      if (user.role?.role_name === RoleName.AGENT) {
        entityType = "AGENT";
      } else if (user.role?.role_name === RoleName.ADMIN) {
        entityType = "ADMIN";
      }

      // Log the TFA reset
      await this.logger.logUserAction(
        { userId: adminUserId } as JwtUser,
        LogAction.USER_TFA_RESET,
        LogSeverity.INFO,
        entityType,
        userId,
        { userId, resetBy: adminUserId },
      );

      return {
        message: "TFA reset successfully",
        tfaSetupUrl: tfaInfo.otpAuthUrl,
        tfaQrCodeBase64: tfaInfo.qrCodeBase64,
      };
    }

    // For regular admins, authorize based on user role and creation
    if (user.role?.role_name === RoleName.MERCHANT) {
      if (!user.merchant || user.merchant.created_by !== adminUserId) {
        throw new ForbiddenException(
          "You are not authorized to reset TFA for this merchant",
        );
      }
    } else if (user.role?.role_name === RoleName.AGENT) {
      if (
        !user.agent ||
        !user.agent.merchant ||
        user.agent.merchant.created_by !== adminUserId
      ) {
        throw new ForbiddenException(
          "You are not authorized to reset TFA for this agent",
        );
      }
    } else {
      throw new ForbiddenException(
        "You are not authorized to reset TFA for this user type",
      );
    }

    // Generate and store a new TFA secret
    const tfaInfo = await this.generateAndStoreTfaSecret(userId, {
      userId: adminUserId,
    } as JwtUser);

    // Determine entity type based on user role for logging
    let entityType: EntityType = "MERCHANT";
    if (user.role?.role_name === RoleName.AGENT) {
      entityType = "AGENT";
    }

    // Log the TFA reset
    await this.logger.logUserAction(
      { userId: adminUserId } as JwtUser,
      LogAction.USER_TFA_RESET,
      LogSeverity.INFO,
      entityType,
      userId,
      { userId, resetBy: adminUserId },
    );

    return {
      message: "TFA reset successfully",
      tfaSetupUrl: tfaInfo.otpAuthUrl,
      tfaQrCodeBase64: tfaInfo.qrCodeBase64,
    };
  }

  /**
   * Verifies a TOTP token against a user's secret
   * @param userId User ID
   * @param token Token entered by the user
   * @returns Boolean indicating if token is valid
   */
  async verifyTfaToken(userId: string, token: string): Promise<boolean> {
    // Find user with their TFA secret
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user || !user.tfa_secret) {
      return false;
    }

    // Decrypt the secret
    const decryptedSecret = this.encryptionService.decrypt(user.tfa_secret);
    if (!decryptedSecret) {
      return false;
    }

    // Convert secret string to Buffer for validation
    const secretBuffer = Buffer.from(decryptedSecret, "utf8");

    // Verify the token with a window of 1 period to allow for clock drift
    return validateTOTP(token, secretBuffer, 1);
  }

  /**
   * Enables TFA for a user by storing their secret
   * @param userId User ID
   * @param dto DTO containing the secret
   * @param adminUserId Admin user ID performing the action
   * @returns Updated user with sensitive fields omitted
   */
  async enableTfa(
    userId: string,
    dto: { secret: string },
    adminUserId: string,
  ): Promise<
    Omit<
      User,
      "password_hash" | "tfa_secret" | "deleted_at" | "hashed_refresh_token"
    >
  > {
    // Find the user to check permissions
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        role: true,
        admin: true,
        merchant: { select: { created_by: true } },
        agent: {
          include: {
            merchant: { select: { created_by: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if admin is authorized
    const isSuperAdmin = await this.isSuperAdmin(adminUserId);

    // Only allow if superadmin or the admin created this merchant/agent
    if (!isSuperAdmin) {
      const roleName = user.role?.role_name;

      if (roleName === RoleName.MERCHANT) {
        if (!user.merchant || user.merchant.created_by !== adminUserId) {
          throw new ForbiddenException(
            "You are not authorized to enable TFA for this merchant",
          );
        }
      } else if (roleName === RoleName.AGENT) {
        if (
          !user.agent ||
          !user.agent.merchant ||
          user.agent.merchant.created_by !== adminUserId
        ) {
          throw new ForbiddenException(
            "You are not authorized to enable TFA for this agent",
          );
        }
      } else if (roleName === RoleName.ADMIN) {
        throw new ForbiddenException(
          "Only superadmins can enable TFA for other admin accounts",
        );
      }
    }

    // Encrypt the secret before storing
    const encryptedSecret = this.encryptionService.encrypt(dto.secret);
    if (!encryptedSecret) {
      throw new InternalServerErrorException("Failed to encrypt TFA secret");
    }

    // Update user's TFA status
    const updatedUser = await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        tfa_secret: encryptedSecret,
      },
    });

    // Log the action
    let entityType: EntityType = "MERCHANT";
    if (user.role?.role_name === RoleName.AGENT) {
      entityType = "AGENT";
    } else if (user.role?.role_name === RoleName.ADMIN) {
      entityType = "ADMIN";
    }

    await this.logger.logUserAction(
      { userId: adminUserId } as JwtUser,
      LogAction.TFA_SETUP,
      LogSeverity.INFO,
      entityType,
      userId,
      { userId, enabledBy: adminUserId },
    );

    // Return sanitized user
    const {
      password_hash,
      tfa_secret,
      deleted_at,
      hashed_refresh_token,
      ...safeUser
    } = updatedUser;
    return safeUser;
  }

  /**
   * Disables TFA for a user
   * @param userId User ID
   * @param adminUserId Admin user ID performing the action
   * @returns Updated user with sensitive fields omitted
   */
  async disableTfa(
    userId: string,
    adminUserId: string,
  ): Promise<
    Omit<
      User,
      "password_hash" | "tfa_secret" | "deleted_at" | "hashed_refresh_token"
    >
  > {
    // Find the user to check permissions
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        role: true,
        admin: true,
        merchant: { select: { created_by: true } },
        agent: {
          include: {
            merchant: { select: { created_by: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if admin is authorized
    const isSuperAdmin = await this.isSuperAdmin(adminUserId);

    // Only allow if superadmin or the admin created this merchant/agent
    if (!isSuperAdmin) {
      const roleName = user.role?.role_name;

      if (roleName === RoleName.MERCHANT) {
        if (!user.merchant || user.merchant.created_by !== adminUserId) {
          throw new ForbiddenException(
            "You are not authorized to disable TFA for this merchant",
          );
        }
      } else if (roleName === RoleName.AGENT) {
        if (
          !user.agent ||
          !user.agent.merchant ||
          user.agent.merchant.created_by !== adminUserId
        ) {
          throw new ForbiddenException(
            "You are not authorized to disable TFA for this agent",
          );
        }
      } else if (roleName === RoleName.ADMIN) {
        throw new ForbiddenException(
          "Only superadmins can disable TFA for other admin accounts",
        );
      }
    }

    // Update user to disable TFA
    const updatedUser = await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        tfa_secret: null,
      },
    });

    // Log the action
    let entityType: EntityType = "MERCHANT";
    if (user.role?.role_name === RoleName.AGENT) {
      entityType = "AGENT";
    } else if (user.role?.role_name === RoleName.ADMIN) {
      entityType = "ADMIN";
    }

    await this.logger.logUserAction(
      { userId: adminUserId } as JwtUser,
      LogAction.TFA_DISABLED,
      LogSeverity.INFO,
      entityType,
      userId,
      { userId, disabledBy: adminUserId },
    );

    // Return sanitized user
    const {
      password_hash,
      tfa_secret,
      deleted_at,
      hashed_refresh_token,
      ...safeUser
    } = updatedUser;
    return safeUser;
  }

  /**
   * Updates a user's active status
   *
   * @param id User ID to update
   * @param isActive New active status
   * @param currentAdmin Admin performing the update
   * @param roleName Role name to confirm user type
   * @returns Updated user
   */
  async updateUserStatus(
    id: string,
    isActive: boolean,
    currentAdmin: JwtUser,
    roleName: RoleName,
    prohibitedUserIds: string[] = [],
  ): Promise<
    Omit<
      User,
      "password_hash" | "tfa_secret" | "deleted_at" | "hashed_refresh_token"
    >
  > {
    // Check if this is a protected user ID that can't be deactivated
    if (prohibitedUserIds.includes(id) && isActive === false) {
      throw new BadRequestException(`This ${roleName} cannot be deactivated.`);
    }

    if (id === currentAdmin.userId.toString() && isActive === false) {
      throw new BadRequestException("Cannot deactivate your own account.");
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          user_id: id,
          role: { role_name: roleName },
          deleted_at: null,
        },
        data: { is_active: isActive },
      });

      this.logger.logUserAction(
        currentAdmin,
        LogAction.USER_CREATED,
        LogSeverity.INFO,
        "user",
        id,
        { isActive },
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        password_hash,
        tfa_secret,
        deleted_at,
        hashed_refresh_token,
        ...safeUser
      } = updatedUser;

      return safeUser;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      this.logger.standardError(
        `Failed to update ${roleName} status for user ${id}: ${(error as Error).message}`,
        (error as Error).stack,
        "AdminUsersService",
      );
      throw new InternalServerErrorException(`Failed to update user status.`);
    }
  }

  /**
   * Updates a user's status based on their role with proper authorization checks
   * Centralizes status update logic for users of all roles (merchant, agent, admin)
   *
   * @param userId User ID to update
   * @param isActive New status
   * @param currentAdmin Admin performing the update
   * @returns Updated user object
   */
  async updateUserRoleStatus(
    userId: string,
    isActive: boolean,
    currentAdmin: JwtUser,
  ): Promise<
    Omit<
      User,
      "password_hash" | "tfa_secret" | "deleted_at" | "hashed_refresh_token"
    >
  > {
    // Find user with their role and related entity info
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        role: true,
        admin: true,
        merchant: { select: { created_by: true } },
        agent: {
          include: {
            merchant: { select: { created_by: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.deleted_at) {
      throw new BadRequestException(
        `Cannot update status for deleted user with ID ${userId}`,
      );
    }

    // Determine user role and check authorization
    const roleName = user.role?.role_name;
    if (!roleName) {
      throw new BadRequestException(`User ${userId} has no assigned role`);
    }

    // Check if the admin user is a superadmin
    const isSuperAdmin = await this.isSuperAdmin(currentAdmin.userId);

    // For regular admins, check creator relationship
    if (!isSuperAdmin) {
      // For merchant users, check if admin created the merchant
      if (roleName === RoleName.MERCHANT) {
        if (
          !user.merchant ||
          user.merchant.created_by !== currentAdmin.userId
        ) {
          throw new ForbiddenException(
            "You are not authorized to update this merchant's status",
          );
        }
      }
      // For agent users, check if admin created the agent's merchant
      else if (roleName === RoleName.AGENT) {
        if (
          !user.agent ||
          !user.agent.merchant ||
          user.agent.merchant.created_by !== currentAdmin.userId
        ) {
          throw new ForbiddenException(
            "You are not authorized to update this agent's status",
          );
        }
      }
      // For other roles, apply role-specific logic
      else if (roleName === RoleName.ADMIN) {
        throw new ForbiddenException(
          "Only superadmins can update other admin accounts",
        );
      }
    }

    // No prohibited IDs for normal status updates - prevents disabling system accounts
    const prohibitedUserIds: string[] = [];

    // If it's an admin account, prevent disabling superadmins
    if (
      roleName === RoleName.ADMIN &&
      user.admin &&
      user.admin.is_super === true
    ) {
      prohibitedUserIds.push(userId);
    }

    // Use the updateUserStatus method for the actual update
    return this.updateUserStatus(
      userId,
      isActive,
      currentAdmin,
      roleName,
      prohibitedUserIds,
    );
  }

  /**
   * Generates a unique ID for a user based on their role
   *
   * @param role The role name to generate an ID for
   * @returns A unique ID with the appropriate prefix
   */
  private async generateUserIdByRole(role: RoleName): Promise<string> {
    switch (role) {
      case RoleName.ADMIN:
        return this.idGeneratorService.generateUniqueAdminId();
      case RoleName.MERCHANT:
        return this.idGeneratorService.generateUniqueMerchantId();
      case RoleName.AGENT:
        return this.idGeneratorService.generateUniqueAgentId();
      default:
        throw new Error(`Unsupported role: ${role}`);
    }
  }
}
