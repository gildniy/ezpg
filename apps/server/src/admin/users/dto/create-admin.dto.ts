import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAdminDto {
  @ApiProperty({
    description: "Username for the admin account",
    example: "admin_user123",
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description:
      "Password for the admin account (min 8 chars, must include uppercase, lowercase, number/special char)",
    example: "AdminPass123!",
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "Password is too weak.",
  })
  password: string;
  // Role is implicitly ADMIN
}
