import { ApiProperty } from "@nestjs/swagger";
import { WithdrawalStatus } from "@ezpg/database";

export class WithdrawalResponseDto {
  @ApiProperty({ description: "Withdrawal request ID", example: 12345 })
  withdrawalId: number;

  @ApiProperty({
    description: "Entity ID (merchantId or agentId)",
    example: "M12345678",
  })
  entityId: string;

  @ApiProperty({
    description: "Entity type (MERCHANT or AGENT)",
    example: "MERCHANT",
    enum: ["MERCHANT", "AGENT"],
  })
  entityType: string;

  @ApiProperty({ description: "Withdrawal amount", example: "500000" })
  amount: string;

  @ApiProperty({
    description: "Bank code",
    example: "KB001",
  })
  bankCode: string;

  @ApiProperty({
    description: "Bank account number",
    example: "1234567890123456",
  })
  bankAccountNumber: string;

  @ApiProperty({
    description: "Bank account holder name",
    example: "John Doe",
  })
  bankAccountHolder: string;

  @ApiProperty({
    description: "Current withdrawal status",
    example: "PENDING",
    enum: WithdrawalStatus,
    enumName: "WithdrawalStatus",
  })
  status: WithdrawalStatus;

  @ApiProperty({
    description: "Request timestamp",
    example: "2023-01-01T00:00:00Z",
  })
  requestedAt: Date;

  @ApiProperty({
    description: "Processing timestamp",
    example: "2023-01-01T01:00:00Z",
    required: false,
  })
  processedAt?: Date;

  @ApiProperty({
    description: "Admin ID who processed the withdrawal",
    example: "A12345678",
    required: false,
  })
  processedBy?: number;

  @ApiProperty({
    description: "Additional notes",
    example: "Approved according to policy",
    required: false,
  })
  note?: string;
}

export class PaginatedWithdrawalsResponseDto {
  @ApiProperty({
    description: "Array of withdrawal records",
    type: [WithdrawalResponseDto],
    isArray: true,
  })
  data: WithdrawalResponseDto[];

  @ApiProperty({
    description: "Total number of withdrawals matching the query",
    example: 45,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 5 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}

export class WithdrawalUpdateResponseDto {
  @ApiProperty({
    description: "Updated withdrawal record",
    type: WithdrawalResponseDto,
  })
  withdrawal: WithdrawalResponseDto;

  @ApiProperty({
    description: "Success message",
    example: "Withdrawal status updated successfully",
  })
  message: string;
}
