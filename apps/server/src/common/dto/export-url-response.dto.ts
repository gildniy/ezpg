import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO for export URL responses
 * Used when exporting data to Excel or other formats
 */
export class ExportUrlResponseDto {
  @ApiProperty({
    description: "URL for downloading the exported file",
    example: "/download/export-123456.xlsx",
  })
  url: string;
}
