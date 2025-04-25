import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { ComplaintStatus } from "@ezpg/database";
import { TransformDecimal } from "../../../common/decorators/transform-decimal.decorator";
import { Decimal } from "@prisma/client/runtime/library";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateComplaintDto {
  @ApiPropertyOptional({
    description: "Updated details of the complaint",
    example: "I have a complaint about the service",
    required: false,
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    enum: ComplaintStatus,
    description: "New status for the complaint",
    example: ComplaintStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiPropertyOptional({
    description: "Updated name of the complainant",
    maxLength: 100,
    example: "John Doe",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  complainantName?: string;

  @ApiPropertyOptional({
    description: "Updated related account number",
    maxLength: 50,
    example: "1234567890",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  relatedAccountNumber?: string;

  @ApiPropertyOptional({
    description: "Updated amount deducted/adjusted",
    type: String,
    example: "55.00",
    required: false,
  })
  @IsOptional()
  @TransformDecimal()
  amountDeducted?: Decimal;

  @ApiPropertyOptional({
    description: "Updated final processed amount",
    type: String,
    example: "55.00",
    required: false,
  })
  @IsOptional()
  @TransformDecimal()
  finalAmount?: Decimal;
}
