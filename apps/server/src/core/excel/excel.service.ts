import { ConfigService } from "@nestjs/config";

import { Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import * as path from "path";

@Injectable()
export class ExcelService {
  constructor(private configService: ConfigService) {}

  async generateExcel<T>(
    data: T[],
    filename: string,
    options: { headers: { key: string; header: string }[] },
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Deposits");

    // Add headers
    worksheet.columns = options.headers;

    // Add rows
    worksheet.addRows(data);

    // Format columns
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    // Save to file
    const uploadsDir = this.configService.get("UPLOADS_DIR", "uploads");
    const serverDir = path.join(process.cwd(), "apps", "server");
    const filePath = path.join(serverDir, uploadsDir, filename);

    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }
}
