import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService, User } from "@ezpg/database";
import { EncryptionService } from "../core/encryption/encryption.service";
import { AppConfigService } from "../config/app-config.service";
import { authenticator } from "otplib";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * Find a user by ID
   *
   * @param userId The user ID to find
   * @returns The user or null if not found
   */
  async findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { user_id: userId },
    });
  }

  async findActiveById(userId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        user_id: userId,
        is_active: true,
      },
    });
  }

  async generateTfaSecret(
    userId: string,
  ): Promise<{ secret: string; otpAuthUrl: string }> {
    const user = await this.findUserById(userId);
    if (!user) throw new NotFoundException("User not found.");

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      user.username,
      this.configService.appName,
      secret,
    );
    const encryptedSecret = this.encryptionService.encrypt(secret);
    if (!encryptedSecret)
      throw new InternalServerErrorException("Failed to encrypt TFA secret.");

    await this.prisma.user.update({
      where: { user_id: userId },
      data: { tfa_secret: encryptedSecret },
    });

    return { secret, otpAuthUrl };
  }

  async enableTfa(userId: string, tfaCode: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user || !user.tfa_secret) {
      throw new BadRequestException(
        "User not found or TFA secret not generated yet.",
      );
    }

    const decryptedSecret = this.encryptionService.decrypt(user.tfa_secret);
    if (!decryptedSecret) {
      console.error(`Failed to decrypt TFA secret for user ${userId}`);
      throw new InternalServerErrorException("Could not verify TFA code.");
    }

    const isCodeValid = authenticator.verify({
      token: tfaCode,
      secret: decryptedSecret,
    });

    if (!isCodeValid) {
      throw new BadRequestException("Invalid TFA code provided.");
    }

    await this.prisma.user.update({
      where: { user_id: userId },
      data: { tfa_secret: decryptedSecret },
    });
    console.log(`[UsersService] TFA enabled for user ${userId}`);
  }

  async disableTfa(userId: string): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (!user.tfa_secret) {
      console.log(`[UsersService] TFA already disabled for user ${userId}`);
      return;
    }

    await this.prisma.user.update({
      where: { user_id: userId },
      data: { tfa_secret: null },
    });
    console.log(`[UsersService] TFA disabled for user ${userId}`);
  }
}
