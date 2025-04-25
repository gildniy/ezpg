import { ApiProperty } from "@nestjs/swagger";
import { WithdrawalStatus } from "@ezpg/database";
import { PaginatedResponse } from "../../../common/dto/paginated-response.dto";

export class MerchantWithdrawalResponseDto {
  @ApiProperty({ example: "12345" })
  withdrawalId: string;

  @ApiProperty({ example: "2023-05-01T15:30:00Z" })
  requestedAt: Date;

  @ApiProperty({ example: "merchant1" })
  merchantId: string;

  @ApiProperty({ example: "Test Affiliate" })
  affiliate: string;

  @ApiProperty({ example: "Test Company" })
  companyName: string;

  @ApiProperty({ example: "John Doe" })
  accountHolder: string;

  @ApiProperty({ example: "Bank Name" })
  bank: string;

  @ApiProperty({ example: "1234567890" })
  accountNumber: string;

  @ApiProperty({ example: 100000 })
  amount: number;

  @ApiProperty({
    enum: WithdrawalStatus,
    example: WithdrawalStatus.PENDING,
    enumName: "WithdrawalStatus",
  })
  status: WithdrawalStatus;

  @ApiProperty({ example: "2023-05-02T10:15:00Z", nullable: true })
  processedAt: Date | null;

  @ApiProperty({ example: "Bank transfer", nullable: true })
  withdrawalMethod: string | null;

  @ApiProperty({ example: "Withdrawal notes", nullable: true })
  notes: string | null;
}

// Extend from the base PaginatedResponse class
export class PaginatedMerchantWithdrawalsResponseDto extends PaginatedResponse<MerchantWithdrawalResponseDto> {
  @ApiProperty({ type: [MerchantWithdrawalResponseDto] })
  declare data: MerchantWithdrawalResponseDto[];

  @ApiProperty({ type: [MerchantWithdrawalResponseDto] })
  declare items: MerchantWithdrawalResponseDto[];
}
