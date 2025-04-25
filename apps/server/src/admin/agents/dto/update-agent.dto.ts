import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  IsEnum,
  IsArray,
  ValidateIf,
  Matches,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AgentStatus } from "./agent-status.enum";
import { NotificationTime, NotificationType } from "@ezpg/database";

/**
 * Data Transfer Object for updating an existing agent
 * All properties are optional since updates can be partial
 */
export class UpdateAgentDto {
  @ApiPropertyOptional({
    description: "Agent name (display name)",
    example: "John Smith",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  agentName?: string;

  @ApiPropertyOptional({
    description: "Email address for the agent",
    example: "agent2.updated@example.com",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: "Phone number for the agent",
    example: "010-1234-5678",
  })
  @IsOptional()
  @IsPhoneNumber("KR")
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: "Bank name for agent withdrawals",
    example: "KB Bank",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({
    description: "Bank account number for agent withdrawals",
    example: "0987654321",
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumber?: string;

  @ApiPropertyOptional({
    description: "Account holder name for agent withdrawals",
    example: "John Smith",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountHolder?: string;

  @ApiPropertyOptional({
    description: "Enable OTP (two-factor authentication) for the agent",
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  otpEnabled?: boolean;

  @ApiPropertyOptional({
    description: "Status of the agent",
    enum: AgentStatus,
  })
  @IsOptional()
  status?: AgentStatus;

  @ApiPropertyOptional({
    description: "Notification time period",
    enum: NotificationTime,
    default: NotificationTime.TWENTY_FOUR_HOURS,
  })
  @IsEnum(NotificationTime)
  @IsOptional()
  notificationTime?: NotificationTime;

  @ApiPropertyOptional({
    description:
      "Custom notification time period (e.g., '9:00-12:00,13:00-18:00')",
  })
  @ValidateIf((o) => o.notificationTime === NotificationTime.CUSTOM)
  @Matches(/^\d{1,2}:\d{2}-\d{1,2}:\d{2}(,\d{1,2}:\d{2}-\d{1,2}:\d{2})*$/, {
    message:
      "Custom notification time must be in the format '9:00-12:00,13:00-18:00'",
  })
  @IsOptional()
  notificationTimeCustom?: string;

  @ApiPropertyOptional({
    description: "Notification types",
    enum: NotificationType,
    isArray: true,
    default: [NotificationType.PAYMENT_FAILED, NotificationType.SYSTEM_DOWN],
  })
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  @IsOptional()
  notificationTypes?: NotificationType[];
}
