import { ApiProperty } from "@nestjs/swagger";

export class NoticeResponseDto {
  @ApiProperty({ description: "Notice ID", example: 123 })
  notice_id: number;

  @ApiProperty({
    description: "Notice title",
    example: "System Maintenance Notice",
  })
  title: string;

  @ApiProperty({
    description: "Notice content",
    example: "The system will be down for maintenance...",
  })
  content: string;

  @ApiProperty({
    description: "Whether the notice is pinned to the top",
    example: true,
  })
  is_pinned: boolean;

  @ApiProperty({
    description: "Admin user ID who created the notice",
    example: 1,
  })
  created_by: string;

  @ApiProperty({
    description: "Admin username who created the notice",
    example: "admin_user",
  })
  author_username: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2023-07-15T10:30:00Z",
  })
  created_at: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2023-07-15T14:45:00Z",
  })
  updated_at: Date;
}

export class PaginatedNoticesResponseDto {
  @ApiProperty({
    description: "Array of notices",
    type: [NoticeResponseDto],
    isArray: true,
  })
  data: NoticeResponseDto[];

  @ApiProperty({
    description: "Total number of notices matching the query",
    example: 25,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 3 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}
