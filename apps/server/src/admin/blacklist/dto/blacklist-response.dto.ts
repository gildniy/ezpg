import { ApiProperty } from "@nestjs/swagger";

export class BlacklistEntryDto {
  @ApiProperty({ description: "Blacklist entry ID", example: 123 })
  blacklist_id: number;

  @ApiProperty({
    description: "Type of blacklisted value (BANK_ACCOUNT, PHONE, IP, etc.)",
    example: "BANK_ACCOUNT",
  })
  type: string;

  @ApiProperty({
    description: "The blacklisted value",
    example: "1234567890123456",
  })
  value: string;

  @ApiProperty({
    description: "Bank code if applicable",
    example: "088",
    required: false,
  })
  bank_code?: string;

  @ApiProperty({
    description: "Bank account holder name if applicable",
    example: "John Doe",
    required: false,
  })
  bank_account_holder?: string;

  @ApiProperty({
    description: "Reason for blacklisting",
    example: "Fraudulent activity detected",
  })
  reason: string;

  @ApiProperty({
    description: "Admin user ID who created this entry",
    example: 1,
  })
  created_by: string;

  @ApiProperty({ description: "Admin username", example: "admin_user" })
  created_by_username: string;

  @ApiProperty({
    description: "Entry creation timestamp",
    example: "2023-07-10T14:30:00Z",
  })
  created_at: Date;
}
