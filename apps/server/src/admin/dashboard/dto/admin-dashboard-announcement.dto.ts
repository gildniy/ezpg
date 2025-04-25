import { ApiProperty } from "@nestjs/swagger";

export class AdminDashboardAnnouncementDto {
  @ApiProperty({
    description: "Unique announcement ID",
    example: "ann_12345",
  })
  id: string;

  @ApiProperty({
    description: "Announcement title",
    example: "System Maintenance",
  })
  title: string;

  @ApiProperty({
    description: "Detailed announcement content",
    example:
      "The system will be under maintenance from 2:00 AM to 4:00 AM KST on June 25, 2023.",
  })
  content: string;

  @ApiProperty({
    description: "Timestamp when the announcement was created",
    example: "2023-06-20T15:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Timestamp when the announcement will expire",
    example: "2023-06-25T05:00:00Z",
  })
  expiresAt: Date;

  @ApiProperty({
    description: "Is this announcement active",
    example: true,
  })
  isActive: boolean;
}
