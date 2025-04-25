import { ApiProperty } from "@nestjs/swagger";
import { RoleName } from "@ezpg/database";

// Defines the shape of the User object returned by Auth endpoints,
// excluding sensitive fields like password hash, TFA secret, etc.
export class UserResponseDto {
  @ApiProperty({ example: "user123" })
  userId: string;

  @ApiProperty({ example: "testuser" })
  username: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: "Indicates if user must change password on next login",
  })
  firstLogin: boolean;

  @ApiProperty({
    example: true,
    description: "Indicates if TFA is currently enabled for the user",
  })
  tfaEnabled: boolean;

  @ApiProperty({
    example: "ADMIN",
    enum: RoleName,
    enumName: "UserType",
  })
  roleName: RoleName; // Assuming role name is included

  @ApiProperty({
    type: "string",
    format: "date-time",
    example: "2023-10-27T10:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    type: "string",
    format: "date-time",
    example: "2023-10-27T10:00:00.000Z",
  })
  updatedAt: Date;

  // Optional last login time
  @ApiProperty({
    type: "string",
    format: "date-time",
    example: "2023-10-27T10:00:00.000Z",
    required: false,
  })
  lastLoginAt?: Date;
}
