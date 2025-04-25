import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { PaginatedResponse } from "../../../common/dto/paginated-response.dto";
import { NotificationType, NotificationTime } from "@ezpg/database";

/**
 * Data Transfer Object for agent response data
 * Used for sending agent data in API responses
 */
export class AgentResponseDto {
  @ApiProperty({ description: "Unique ID", example: 1 })
  id?: number;

  @ApiProperty({ description: "Username", example: "agent123" })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: "Agent ID/username", example: "AG000001" })
  agentId: string;

  @ApiProperty({
    description: "Agent name",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  agentName: string;

  @ApiPropertyOptional({
    description: "Merchant ID the agent belongs to",
    example: "merchant_123",
  })
  @IsString()
  @IsOptional()
  merchantId?: string;

  @ApiProperty({
    description: "Current balance",
    type: String,
    example: "39,059",
  })
  @IsString()
  @IsNotEmpty()
  balance: string;

  @ApiProperty({
    description: "Agent status",
    example: "active",
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({
    description: "Email address",
    example: "agent@example.com",
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: "Phone number",
    example: "010-1234-5678",
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: "Commission rate",
    example: "3.5%",
  })
  @IsString()
  @IsOptional()
  commission?: string;

  @ApiPropertyOptional({
    description: "Bank name for withdrawals",
    example: "Bank of America",
  })
  @IsString()
  @IsNotEmpty()
  withdrawalBankName?: string;

  @ApiPropertyOptional({
    description: "Account number for withdrawals",
    example: "1234567890",
  })
  @IsString()
  @IsNotEmpty()
  withdrawalAccountNumber?: string;

  @ApiPropertyOptional({
    description: "Account holder name for withdrawals",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  withdrawalAccountHolder?: string;

  @ApiProperty({
    description: "OTP enabled status",
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  otpEnabled: boolean;

  @ApiPropertyOptional({
    description: "Merchant ID",
    example: "ME000001",
  })
  @IsString()
  @IsOptional()
  mid?: string;

  @ApiPropertyOptional({
    description: "Merchant key",
    example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  })
  @IsString()
  @IsOptional()
  mkey?: string;

  @ApiPropertyOptional({
    description: "Callback URL",
    example: "https://api.agent.com/callback",
  })
  @IsString()
  @IsOptional()
  callbackUrl?: string;

  @ApiPropertyOptional({
    description: "Dashboard ID",
    example: "agent_admin",
  })
  @IsString()
  @IsOptional()
  dashboardId?: string;

  @ApiPropertyOptional({
    description: "Dashboard password (masked)",
    example: "••••••••",
  })
  @IsString()
  @IsOptional()
  dashboardPassword?: string;

  @ApiProperty({
    description: "Date and time when the agent was created",
    example: "2025/02/18 20:42:23",
  })
  @IsString()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty({
    description: "User ID who created the agent",
    example: "AD000001",
  })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({
    description: "User name who created the agent",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  createdByName: string;

  @ApiProperty({
    description: "Date and time when the agent was last updated",
    example: "2025/02/18 20:42:23",
  })
  @IsString()
  @IsNotEmpty()
  updatedAt: string;

  @ApiPropertyOptional({
    description: "Date and time when the agent was deleted",
    example: "2025/02/18 20:42:23",
  })
  @IsString()
  @IsOptional()
  deletedAt?: string;

  @ApiPropertyOptional({
    description: "Notification Types",
    enum: NotificationType,
    isArray: true,
    example: ["PAYMENT_FAILED", "SYSTEM_DOWN"],
  })
  @IsArray()
  @IsOptional()
  notificationTypes?: string[];

  @ApiPropertyOptional({
    description: "Notification Time",
    enum: NotificationTime,
    example: "CUSTOM",
  })
  @IsString()
  @IsOptional()
  notificationTime?: string;

  @ApiPropertyOptional({
    description: "Notification Time Custom",
    example: "09:00-12:00",
  })
  @IsString()
  @IsOptional()
  notificationTimeCustom?: string;

  @ApiPropertyOptional({
    description: "Telegram ID",
    example: "@agent123",
  })
  @IsString()
  @IsOptional()
  telegramId?: string;

  @ApiPropertyOptional({
    description: "TFA QR Code (only if TFA is enabled)",
    example: "data:image/png;base64,iVBORw0KGgoA...",
  })
  @IsString()
  @IsOptional()
  tfaQrCodeBase64?: string;
}

/**
 * Data Transfer Object for paginated agent response
 * Used for API endpoints that return multiple agents with pagination
 */
export class PaginatedAgentResponseDto extends PaginatedResponse<AgentResponseDto> {
  @ApiProperty({
    description: "Array of agent records",
    type: [AgentResponseDto],
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  declare data: AgentResponseDto[];

  @ApiProperty({
    description:
      "Array of agent records (alias for 'data', used by OpenAPI generator)",
    type: [AgentResponseDto],
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  declare items: AgentResponseDto[];
}
