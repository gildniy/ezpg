import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FirstLoginChangePasswordDto {
  @ApiProperty({
    description:
      "New password (min 8 chars, must include uppercase, lowercase, and number/special char)",
    example: "NewPassword123!",
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "New password must be at least 8 characters long" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "New password is too weak. Require uppercase, lowercase, and number/special character.",
  })
  newPassword: string;
}
