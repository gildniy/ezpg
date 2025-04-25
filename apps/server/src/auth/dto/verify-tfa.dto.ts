import { IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyTfaDto {
  @ApiProperty({
    description: "Six-digit authentication code from your authenticator app",
    example: "123456",
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: "TFA code must be exactly 6 digits" })
  tfaCode: string;
}
