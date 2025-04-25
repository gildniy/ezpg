import { ApiProperty } from "@nestjs/swagger";

export class BankResponseDto {
  @ApiProperty({
    description: "Bank code",
    example: "KB001",
  })
  bankCode: string;

  @ApiProperty({
    description: "Bank name",
    example: "Korea Bank",
  })
  bankName: string;

  @ApiProperty({
    description: "Whether the bank is active",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Number of merchant groups using this bank",
    example: 5,
  })
  groupCount?: number;

  @ApiProperty({
    description: "Creation date",
    example: "2023-01-01T00:00:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last updated date",
    example: "2023-01-01T00:00:00Z",
  })
  updatedAt: Date;
}
