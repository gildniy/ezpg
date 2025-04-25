import { ApiProperty } from "@nestjs/swagger";

export class AdminLogDto {
  @ApiProperty({ description: "Log ID", example: 12345 })
  log_id: number;

  @ApiProperty({ description: "Admin user ID", example: 1 })
  admin_id: string;

  @ApiProperty({ description: "Admin username", example: "admin_user" })
  admin_username: string;

  @ApiProperty({
    description: "Action performed",
    example: "UPDATE_MERCHANT_STATUS",
  })
  action: string;

  @ApiProperty({ description: "Type of entity affected", example: "merchant" })
  entity_type: string;

  @ApiProperty({ description: "ID of entity affected", example: "sticpay" })
  entity_id: string;

  @ApiProperty({ description: "IP address of admin", example: "192.168.1.1" })
  ip_address: string;

  @ApiProperty({
    description: "Additional details of action",
    example: { status: "ACTIVE", previousStatus: "INACTIVE" },
    type: "object",
  })
  details: Record<string, unknown>;

  @ApiProperty({
    description: "Action timestamp",
    example: "2023-07-15T14:30:00Z",
  })
  created_at: Date;

  @ApiProperty({
    description: "Additional metadata",
    example: { key: "value" },
    type: "object",
  })
  metadata: Record<string, unknown>;
}

export class PaginatedAdminLogResponseDto {
  @ApiProperty({
    description: "Array of admin logs",
    type: [AdminLogDto],
    isArray: true,
  })
  data: AdminLogDto[];

  @ApiProperty({
    description: "Total number of logs matching the query",
    example: 156,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 16 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}
