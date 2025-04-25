import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

// Define enums locally if needed for validation/Swagger
enum AccountType {
  STATIC = "0",
  DYNAMIC = "1",
}

enum IssueStatus {
  UNISSUED = "0",
  ISSUED = "1",
}

enum RegistrationStatus {
  UNREGISTERED = "0",
  REGISTERED = "1",
}

export class VirtualAccountQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Filter by merchant ID (VARCHAR 8)",
    example: "sticpay",
  })
  @IsOptional()
  @IsString()
  @Length(4, 8)
  merchantId?: string;

  @ApiPropertyOptional({
    description: "Filter by bank code (CHAR 3)",
    example: "088",
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  bankCode?: string;

  @ApiPropertyOptional({ description: "Filter by account number (CHAR 16)" })
  @IsOptional()
  @IsString()
  @Length(10, 16)
  accountNumber?: string; // Allow partial? Use contains instead

  @ApiPropertyOptional({
    enum: AccountType,
    description: "Filter by account type (0: Static, 1: Dynamic)",
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @ApiPropertyOptional({
    enum: IssueStatus,
    description: "Filter by issue status (0: Unissued, 1: Issued)",
  })
  @IsOptional()
  @IsEnum(IssueStatus)
  issueStatus?: IssueStatus;

  @ApiPropertyOptional({
    enum: RegistrationStatus,
    description:
      "Filter by registration status (0: Unregistered, 1: Registered)",
  })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  registrationStatus?: RegistrationStatus;

  // Search can target userName, accountNumber, merchantId
}
