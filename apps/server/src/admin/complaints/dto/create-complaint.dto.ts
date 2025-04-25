import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";
import { TransformDecimal } from "../../../common/decorators/transform-decimal.decorator";
import { Decimal } from "@prisma/client/runtime/library";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateComplaintDto {
  @ApiProperty({
    description: "Internal ID of the related merchant",
    example: 1234567890,
    required: true,
  })
  @IsInt()
  @IsPositive()
  merchantInternalId: number;

  @ApiProperty({
    description: "Details of the complaint",
    example: "I have a complaint about the service",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  details: string;

  @ApiPropertyOptional({
    description: "Name of the person lodging the complaint",
    maxLength: 100,
    example: "John Doe",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  complainantName?: string;

  @ApiPropertyOptional({
    description: "Bank account number related to the complaint",
    maxLength: 50,
    example: "1234567890",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  relatedAccountNumber?: string;

  @ApiPropertyOptional({
    description: "Amount deducted or adjusted due to the complaint",
    type: String,
    example: "50.00",
    required: false,
  })
  @IsOptional()
  @TransformDecimal()
  amountDeducted?: Decimal;

  @ApiPropertyOptional({
    description: "Final processed amount related to the complaint",
    type: String,
    example: "50.00",
    required: false,
  })
  @IsOptional()
  @TransformDecimal()
  finalAmount?: Decimal;
}
