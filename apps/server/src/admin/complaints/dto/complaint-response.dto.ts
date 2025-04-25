import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaginatedResult } from "../../../common/interfaces/paginated-result.interface";

export class ComplaintResponseDto {
  @ApiProperty({ description: "Complaint ID", example: 123 })
  complaintId: number;

  @ApiProperty({
    description: "Merchant ID associated with the complaint",
    example: "sticpay",
  })
  merchantId: string;

  @ApiProperty({
    description: "Merchant name",
    example: "Stic Payment Solutions",
  })
  merchantName: string;

  @ApiProperty({
    description: "Complaint details",
    example: "Customer reported unauthorized transaction...",
  })
  details: string;

  @ApiProperty({
    description: "Name of person lodging the complaint",
    example: "John Doe",
    required: false,
  })
  complainantName?: string;

  @ApiProperty({
    description: "Related account number",
    example: "1234567890",
    required: false,
  })
  relatedAccountNumber?: string;

  @ApiProperty({
    description: "Email of complainant",
    example: "john@example.com",
    required: false,
  })
  complainantEmail?: string;

  @ApiProperty({
    description: "Phone number of complainant",
    example: "+821012345678",
    required: false,
  })
  complainantPhone?: string;

  @ApiProperty({
    description: "Current complaint status",
    example: "PENDING",
    enum: ["PENDING", "IN_PROGRESS", "RESOLVED"],
  })
  status: string;

  @ApiPropertyOptional({
    description: "ID of the admin who handled the complaint",
  })
  handledBy?: string;

  @ApiProperty({
    description: "Admin username",
    example: "admin_user",
    required: false,
  })
  handlerUsername?: string;

  @ApiProperty({
    description: "Admin notes on resolution",
    example: "Contacted customer, issue resolved...",
    required: false,
  })
  resolutionNotes?: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2023-07-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Resolution timestamp",
    example: "2023-07-16T14:45:00Z",
    required: false,
  })
  resolvedAt?: Date;

  @ApiProperty({
    description: "Amount deducted or adjusted",
    example: 50.0,
    required: false,
    type: Number,
    nullable: true,
  })
  amountDeducted?: number | null;

  @ApiProperty({
    description: "Final processed amount",
    example: 50.0,
    required: false,
    type: Number,
    nullable: true,
  })
  finalAmount?: number | null;
}

export class PaginatedComplaintsResponseDto
  implements PaginatedResult<ComplaintResponseDto>
{
  @ApiProperty({
    description: "Array of complaints",
    type: [ComplaintResponseDto],
    isArray: true,
  })
  data: ComplaintResponseDto[];

  @ApiProperty({
    description: "Total number of complaints matching the query",
    example: 35,
  })
  totalItems: number;

  @ApiProperty({ description: "Total number of pages", example: 4 })
  totalPages: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  currentPage: number;
}
