import { ApiProperty } from "@nestjs/swagger";
import { RoleName } from "@ezpg/database";

export class AdminUserResponseDto {
  @ApiProperty({ description: "User ID", example: "A12345678" })
  userId: string;

  @ApiProperty({ description: "Admin username", example: "admin_user" })
  username: string;

  @ApiProperty({ description: "Role ID", example: 1 })
  roleId: number;

  @ApiProperty({
    description: "Role name",
    example: "ADMIN",
    enum: RoleName,
    enumName: "UserType",
  })
  roleName: string;

  @ApiProperty({ description: "TFA enabled", example: true })
  tfaEnabled: boolean;

  @ApiProperty({
    description: "Whether first login (needs password change)",
    example: false,
  })
  firstLogin: boolean;

  @ApiProperty({ description: "Is active", example: true })
  isActive: boolean;

  @ApiProperty({
    description: "Created at",
    example: "2023-01-01T00:00:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Updated at",
    example: "2023-01-01T00:00:00Z",
  })
  updatedAt: Date;
}
