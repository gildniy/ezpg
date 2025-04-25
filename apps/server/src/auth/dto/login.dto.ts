import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ description: "Username for login", example: "admin1" })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: "Password for login",
    example: "Password123!",
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;
}
