import { ApiProperty } from "@nestjs/swagger";

export class QnaResponseDto {
  @ApiProperty({ description: "QnA ID", example: 123 })
  qna_id: number;

  @ApiProperty({
    description: "Merchant ID (8-character string)",
    example: "MERCH123",
  })
  merchant_id: string;

  @ApiProperty({ description: "Merchant internal ID", example: 5 })
  merchant_internal_id: number;

  @ApiProperty({
    description: "QnA title",
    example: "Question about withdrawal process",
  })
  title: string;

  @ApiProperty({
    description: "QnA question content",
    example: "I am having an issue with...",
  })
  content: string;

  @ApiProperty({
    description: "Current QnA status",
    example: "PENDING",
    enum: ["PENDING", "ANSWERED"],
  })
  status: string;

  @ApiProperty({
    description: "Timestamp when the question was asked",
    example: "2023-07-15T10:30:00Z",
  })
  created_at: Date;

  @ApiProperty({
    description: "Answer content",
    example: "To resolve your issue...",
    required: false,
  })
  answer?: string;

  @ApiProperty({
    description: "Admin ID who answered the question",
    example: "ADMIN001",
    required: false,
  })
  answered_by?: string;

  @ApiProperty({
    description: "Admin username who answered",
    example: "admin_user",
    required: false,
  })
  admin_username?: string;

  @ApiProperty({
    description: "Timestamp when the question was answered",
    example: "2023-07-15T14:45:00Z",
    required: false,
  })
  answered_at?: Date;
}

export class PaginatedQnaResponseDto {
  @ApiProperty({
    description: "Array of QnA items",
    type: [QnaResponseDto],
    isArray: true,
  })
  data: QnaResponseDto[];

  @ApiProperty({
    description: "Total number of QnA items matching the query",
    example: 35,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 4 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}

export class AnswerQnaResponseDto {
  @ApiProperty({ description: "Updated QnA record", type: QnaResponseDto })
  qna: QnaResponseDto;

  @ApiProperty({
    description: "Success message",
    example: "QnA answered successfully",
  })
  message: string;
}
