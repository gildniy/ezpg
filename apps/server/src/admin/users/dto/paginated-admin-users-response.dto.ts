import { ApiProperty } from "@nestjs/swagger";
import { AdminUserResponseDto } from "./admin-user-response.dto";

export class PaginatedAdminUsersResponseDto {
  @ApiProperty({
    description: "Array of admin users",
    type: [AdminUserResponseDto],
    isArray: true,
  })
  data: AdminUserResponseDto[];

  @ApiProperty({
    description: "Total number of items matching the query",
    example: 25,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 3 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}
