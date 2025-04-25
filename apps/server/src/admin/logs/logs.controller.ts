import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { LogsQueryDto } from "./dto/logs-query.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { Log, RoleName } from "@ezpg/database";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Admin - Logs")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/logs")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class LogsController {
  @Get()
  @ApiOperation({ summary: "Get logs" })
  @ApiQuery({ type: LogsQueryDto })
  @ApiResponse({ status: 200, description: "Returns paginated logs" })
  async findAll(
    @Query() query: LogsQueryDto,
    @CurrentUser("userId") adminuserId: string,
  ): Promise<PaginatedResult<Log>> {
    // Implementation of findAll method
    return null;
  }
}
