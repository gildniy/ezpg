import { IsBoolean, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAdminDto {
  @ApiProperty({
    description: "Whether this admin is a super admin",
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isSuperAdmin?: boolean = false;
}
