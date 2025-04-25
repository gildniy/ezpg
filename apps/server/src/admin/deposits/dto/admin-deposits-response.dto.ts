import { ApiProperty } from "@nestjs/swagger";
import { AdminDepositsItemDto } from "./admin-deposits-item.dto";
import { AdminDepositsStatsDto } from "./admin-deposits-stats.dto";

export class AdminDepositsResponseDto {
  @ApiProperty({
    description: "Array of deposit items",
    type: [AdminDepositsItemDto],
  })
  data: AdminDepositsItemDto[];

  @ApiProperty({
    description: "Pagination metadata",
    type: "object",
    properties: {
      total: { type: "number" },
      page: { type: "number" },
      pageSize: { type: "number" },
      totalPages: { type: "number" },
    },
  })
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };

  @ApiProperty({
    description: "Deposit statistics",
    type: AdminDepositsStatsDto,
  })
  stats: AdminDepositsStatsDto;
}
