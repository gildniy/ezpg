import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AnswerQnaDto {
  @ApiProperty({
    description: "Answer content for the QnA",
    example:
      "Thank you for your inquiry. The withdrawal process typically takes 24-48 hours.",
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
