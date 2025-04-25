import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import { ExportFileGuard } from "../../auth/guards/export-file.guard";
import { DownloadService } from "./download.service";

/**
 * Centralized controller for handling file downloads
 * Used by multiple modules for streaming files to clients
 * Access is controlled by the ExportFileGuard which checks permissions
 */
@ApiTags("Downloads")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("downloads")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard)
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  /**
   * Downloads a generated Excel file
   * ExportFileGuard controls access based on who created the file
   * and user roles (e.g., admin can access files created by their merchants)
   *
   * @param filename - The name of the Excel file to download
   * @param res - Express response object to set headers
   * @returns Streamable file containing the Excel document
   * @throws Error if file doesn't exist or user doesn't have permission
   */
  @ApiOperation({ summary: "Download Excel file" })
  @ApiResponse({
    status: 200,
    description: "Returns Excel file stream",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - No permission to download this file",
  })
  @ApiParam({
    name: "filename",
    description: "Excel file name",
    type: String,
  })
  @UseGuards(ExportFileGuard)
  @Get("excel/:filename")
  async downloadExcel(
    @Param("filename") filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return this.downloadService.streamFile(filename, res, {
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }
}
