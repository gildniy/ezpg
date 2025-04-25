import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResult } from "src/common/interfaces/paginated-result.interface";
import { AdminDepositsItemDto } from "./admin-deposits-item.dto";

export class AdminDepositsPaginatedResponseDto
  implements PaginatedResult<AdminDepositsItemDto>
{
  @ApiProperty({
    description: "Array of deposit items",
    type: [AdminDepositsItemDto],
    isArray: true,
  })
  data: AdminDepositsItemDto[];

  @ApiProperty({
    description: "Total number of deposits matching the query",
    example: 150,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 15 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}
