import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateSuperAdminDto {
  @ApiPropertyOptional({
    description: "Whether this admin is a super admin",
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean = false;
}
