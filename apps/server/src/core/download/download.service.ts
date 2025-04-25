import {
  Injectable,
  InternalServerErrorException,
  StreamableFile,
} from "@nestjs/common";
import * as fs from "fs";
import { createReadStream } from "fs";
import { join } from "path";
import { Response } from "express";
import * as crypto from "crypto";
import { PrismaService } from "@ezpg/database";
import { ExcelService } from "../excel/excel.service";

/**
 * Service for handling file download operations
 * Provides methods for streaming files and setting appropriate response headers
 */
@Injectable()
export class DownloadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly excelService: ExcelService,
  ) {}

  /**
   * Stream a file to the client
   *
   * @param filename - Name of the file to download
   * @param res - Express response object for setting headers
   * @param options - Options for streaming (contentType, etc.)
   * @returns StreamableFile for the client
   */
  async streamFile(
    filename: string,
    res: Response,
    options: {
      contentType: string;
      disposition?: string;
    },
  ): Promise<StreamableFile> {
    const uploadsDir = process.env.UPLOADS_DIR || "uploads";
    const serverDir = join(process.cwd(), "apps", "server");
    const filePath = join(serverDir, uploadsDir, filename);

    console.log(`Download requested for file: ${filename}`);
    console.log(`Looking for file at path: ${filePath}`);

    try {
      // Check if file exists before trying to stream it
      if (!fs.existsSync(filePath)) {
        console.error(`File not found at path: ${filePath}`);
        throw new Error(`File not found: ${filename}`);
      }

      // Get file size and last modified time for logging
      const stats = fs.statSync(filePath);
      console.log(
        `File found! Size: ${stats.size} bytes, Last modified: ${stats.mtime}`,
      );

      const fileStream = createReadStream(filePath);

      // Set appropriate headers
      res.set({
        "Content-Type": options.contentType,
        "Content-Disposition":
          options.disposition || `attachment; filename="${filename}"`,
        "Content-Length": stats.size,
        // Add cache control headers
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });

      console.log(`Streaming file to client: ${filename}`);
      return new StreamableFile(fileStream);
    } catch (error) {
      console.error(`Error streaming file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Create and store an Excel file for download
   *
   * @param data - Array of objects to include in the Excel file
   * @param prefix - Prefix for the generated filename
   * @param options - Excel generation options (headers, etc.)
   * @param userId - ID of the user who created the export
   * @returns URL path for downloading the file
   */
  async createExcelFile<T extends Record<string, unknown>>(
    data: T[],
    prefix: string,
    options: {
      headers: Array<{ key: string; header: string }>;
    },
    userId: string,
  ): Promise<{ url: string }> {
    // Generate a secure random filename
    const secureFilename = `${prefix}-${crypto.randomUUID()}.xlsx`;

    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = process.env.UPLOADS_DIR || "uploads";
      const serverDir = join(process.cwd(), "apps", "server");
      const uploadsPath = join(serverDir, uploadsDir);

      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }

      // Generate Excel file using ExcelService
      const filePath = await this.excelService.generateExcel(
        data,
        secureFilename,
        options,
      );

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new InternalServerErrorException("Failed to generate Excel file");
      }

      // Store file metadata in database with expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Files expire after 24 hours

      await this.prisma.exportFile.create({
        data: {
          filename: secureFilename,
          path: filePath,
          admin_id: userId,
          expires_at: expiresAt,
        },
      });

      // Return URL path for downloading (using excel endpoint instead of direct)
      return { url: `/api/downloads/excel/${secureFilename}` };
    } catch (error) {
      console.error(`Error creating Excel file: ${error}`);
      throw new InternalServerErrorException(
        "Failed to create Excel file for download",
      );
    }
  }
}
