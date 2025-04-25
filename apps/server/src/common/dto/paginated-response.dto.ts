import { ApiProperty } from "@nestjs/swagger";

export class PaginationMeta {
  @ApiProperty({
    description: "Total number of items",
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Number of items per page",
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 10,
  })
  totalPages: number;
}

export class PaginatedResponse<T> {
  @ApiProperty({
    description: "Array of items",
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: "Array of items (alias for 'data', used by OpenAPI generator)",
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    description: "Pagination metadata",
    type: PaginationMeta,
  })
  meta: PaginationMeta;

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 10,
  })
  totalPages: number;
}
