import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class EnableTfaDto {
  @ApiProperty({
    description: "TFA secret to verify",
    example: "ABCDEFGHIJKLMNOP",
  })
  @IsString()
  @IsNotEmpty()
  secret: string;
}
