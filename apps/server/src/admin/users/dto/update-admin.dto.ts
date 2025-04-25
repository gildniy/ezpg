import { IsBoolean, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateAdminDto {
  @ApiPropertyOptional({
    description: "Active status of the admin account",
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  // Add other updatable fields if needed (e.g., reset password - requires careful handling)
}
