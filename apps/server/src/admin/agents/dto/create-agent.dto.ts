import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  MaxLength,
  Min,
  MinLength,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateIf,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { NotificationTime, NotificationType } from "@ezpg/database";

/**
 * Data Transfer Object for creating a new agent
 * Contains all the necessary properties for agent creation
 */
export class CreateAgentDto {
  @ApiProperty({
    description: "Agent ID/username for login (3-50 characters)",
    example: "agent123",
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  agentUsername: string;

  @ApiProperty({
    description: "Agent name (display name)",
    example: "John Doe",
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  agentName: string;

  @ApiProperty({
    description: "Email address for the agent",
    example: "agent2@example.com",
    required: true,
  })
  @ApiProperty({
    description: "Merchant ID that this agent will be associated with",
    example: "sticpay1",
    minLength: 4,
    maxLength: 8,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 8)
  merchantId: string;

  @ApiProperty({
    description: "Initial balance for the agent",
    example: 0,
    default: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  balance: number = 0;

  @ApiProperty({
    description: "Bank name for agent withdrawals",
    example: "Woori Bank",
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bankName: string;

  @ApiProperty({
    description: "Bank account number for agent withdrawals",
    example: "1234567890",
    maxLength: 50,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  accountNumber: string;

  @ApiProperty({
    description: "Account holder name for agent withdrawals",
    example: "John Doe",
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  accountHolder: string;

  @ApiProperty({
    description: "Enable OTP (two-factor authentication) for the agent",
    default: false,
    type: Boolean,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  otpEnabled: boolean = false;

  @ApiProperty({
    description: "Whether the agent account is active",
    default: true,
    type: Boolean,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean = true;

  @ApiProperty({
    description: "Notification time period",
    enum: NotificationTime,
    default: NotificationTime.TWENTY_FOUR_HOURS,
    required: false,
  })
  @IsEnum(NotificationTime)
  @IsOptional()
  notificationTime?: NotificationTime = NotificationTime.TWENTY_FOUR_HOURS;

  @ApiProperty({
    description:
      "Custom notification time period (e.g., '9:00-12:00,13:00-18:00')",
    required: false,
  })
  @ValidateIf((o) => o.notificationTime === NotificationTime.CUSTOM)
  @Matches(/^\d{1,2}:\d{2}-\d{1,2}:\d{2}(,\d{1,2}:\d{2}-\d{1,2}:\d{2})*$/, {
    message:
      "Custom notification time must be in the format '9:00-12:00,13:00-18:00'",
  })
  @IsOptional()
  notificationTimeCustom?: string;

  @ApiProperty({
    description: "Notification types",
    enum: NotificationType,
    isArray: true,
    required: false,
    default: [NotificationType.PAYMENT_FAILED, NotificationType.SYSTEM_DOWN],
  })
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  @IsOptional()
  notificationTypes?: NotificationType[] = [
    NotificationType.PAYMENT_FAILED,
    NotificationType.SYSTEM_DOWN,
  ];
}
