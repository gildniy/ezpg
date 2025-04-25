import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@ezpg/database";
import * as bcrypt from "bcrypt";
import { Prisma, RoleName, User } from "@ezpg/database";
import { EncryptionService } from "../../core/encryption/encryption.service";
import {
  generateOtpAuthUri,
  generateTotpQrCodeDataUri,
  generateTotpSecret,
  validateTOTP,
} from "@ezpg/helpers";
import { IdGeneratorService } from "../../core/id-generator/id-generator.service";

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

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private idGeneratorService: IdGeneratorService,
  ) {}

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

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        user_id: userIdToUse,
        username,
        password_hash: hashedPassword,
        role: roleData,
        tfa_enabled: tfaEnabled,
        first_login: firstLogin,
        is_active: isActive,
      },
    });

    // If TFA should be generated, do so now
    let tfaInfo = null;
    if (generateTfa) {
      tfaInfo = await this.generateAndStoreTfaSecret(user.user_id);
    }

    return { user, tfa: tfaInfo };
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
   * Updates the password for a user
   * @param userId User ID
   * @param newPassword New password
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { user_id: userId },
      data: { password_hash: hashedPassword },
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  /**
   * Generates a TOTP secret for two-factor authentication without storing it
   * @param userId User ID to generate the secret for
   * @returns Object containing the secret and OTP auth URL for QR code
   */
  async generateTfaSecret(
    userId: string,
  ): Promise<{ secret: string; otpAuthUrl: string; qrCodeUrl: string }> {
    // Find the user
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Generate a new secret using crypto utils
    const { base32: secretBase32 } = generateTotpSecret();

    // Generate OTP Auth URI for QR code
    const otpAuthUrl = generateOtpAuthUri(
      user.username,
      secretBase32,
      "EZPG Payment Gateway",
    );

    // Generate QR code
    const qrCodeUrl = await generateTotpQrCodeDataUri(otpAuthUrl);

    // Return the secret, otpauth URL, and QR code URL
    return {
      secret: secretBase32,
      otpAuthUrl,
      qrCodeUrl,
    };
  }

  /**
   * Generates a TFA secret and immediately stores it in the user record
   *
   * @param userId User ID to generate and store the secret for
   * @returns Object containing the secret, URLs, and base64 QR code
   */
  async generateAndStoreTfaSecret(userId: string): Promise<{
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
      "EZPG Payment Gateway",
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
        tfa_enabled: true, // Automatically enable TFA
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
   * Reset the TFA secret for a user, replacing any existing one
   *
   * @param userId User ID to reset TFA for
   * @param adminUserId ID of the admin performing the reset
   * @returns Object containing the new secret, URLs, and base64 QR code
   */
  async resetTfaSecret(
    userId: string,
    adminUserId: string,
  ): Promise<{
    secret: string;
    otpAuthUrl: string;
    qrCodeUrl: string;
    qrCodeBase64: string;
  }> {
    // First check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Generate and store a new TFA secret
    const tfaInfo = await this.generateAndStoreTfaSecret(userId);

    // TODO: Log the TFA reset action here

    return tfaInfo;
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
   * @param secret The verified secret to store
   */
  async enableTfa(userId: string, secret: string): Promise<User> {
    // Encrypt the secret before storing
    const encryptedSecret = this.encryptionService.encrypt(secret);
    if (!encryptedSecret) {
      throw new InternalServerErrorException("Failed to encrypt TFA secret");
    }

    return this.prisma.user.update({
      where: { user_id: userId },
      data: {
        tfa_secret: encryptedSecret,
        tfa_enabled: true,
      },
    });
  }

  /**
   * Disables TFA for a user
   * @param userId User ID
   */
  async disableTfa(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { user_id: userId },
      data: {
        tfa_secret: null,
        tfa_enabled: false,
      },
    });
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
