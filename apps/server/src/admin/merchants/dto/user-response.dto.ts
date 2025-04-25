import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({ description: "User ID", example: 15 })
  user_id: string;

  @ApiProperty({
    description: "Username for merchant login",
    example: "merchant_sticpay",
  })
  username: string;

  @ApiProperty({
    description: "Role ID (references roles table)",
    example: 2,
  })
  role_id: number;

  @ApiProperty({
    description: "Whether Two-Factor Authentication is enabled",
    example: true,
  })
  tfa_enabled: boolean;

  @ApiProperty({
    description:
      "Whether this is the user's first login (requires password change)",
    example: true,
  })
  first_login: boolean;

  @ApiProperty({
    description: "Whether the user account is active",
    example: true,
  })
  is_active: boolean;
}
