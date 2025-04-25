import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminNoticesService } from "./admin-notices.service";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { UpdateNoticeDto } from "./dto/update-notice.dto";
import { NoticeQueryDto } from "./dto/notice-query.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import {
  NoticeResponseDto,
  PaginatedNoticesResponseDto,
} from "./dto/notice-response.dto";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";

@ApiTags("Admin - Notices")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/notices")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminNoticesController {
  constructor(private readonly noticesService: AdminNoticesService) {}

  @Post()
  @ApiOperation({
    summary: "Create Notice",
    description: "Creates a new system notice",
  })
  @ApiBody({ type: CreateNoticeDto })
  @ApiResponse({
    status: 201,
    description: "Notice created successfully",
    type: NoticeResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid input" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  create(
    @Body() dto: CreateNoticeDto,
    @CurrentUser() user: JwtUser,
  ): Promise<NoticeResponseDto> {
    // Page References: Admin -> 공지사항 관리 -> Create Action (admin.pdf, page 19)
    return this.noticesService.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({
    summary: "List Notices",
    description: "Retrieves a paginated list of notices",
  })
  @ApiQuery({ type: NoticeQueryDto })
  @ApiResponse({
    status: 200,
    description: "List of notices retrieved successfully",
    type: PaginatedNoticesResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  findAll(
    @Query() query: NoticeQueryDto,
  ): Promise<PaginatedResult<NoticeResponseDto>> {
    // Page References: Admin -> 공지사항 관리 (admin.pdf, page 19)
    return this.noticesService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get Notice Details",
    description: "Retrieves details of a specific notice",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Notice ID",
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: "Notice details retrieved successfully",
    type: NoticeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Notice not found" })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<NoticeResponseDto> {
    // Page References: Admin -> 공지사항 관리 -> 상세보기 (admin.pdf, page 19 click detail)
    return this.noticesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update Notice",
    description: "Updates an existing notice",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Notice ID",
    example: 123,
  })
  @ApiBody({ type: UpdateNoticeDto })
  @ApiResponse({
    status: 200,
    description: "Notice updated successfully",
    type: NoticeResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid input" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Notice not found" })
  update(
    @Param("id") id: number,
    @Body() dto: UpdateNoticeDto,
    @CurrentUser() user: JwtUser,
  ): Promise<NoticeResponseDto> {
    // Page References: Admin -> 공지사항 관리 -> 상세보기 -> Edit Action
    return this.noticesService.update(id, dto, user.userId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete Notice",
    description: "Deletes an existing notice",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Notice ID",
    example: 123,
  })
  @ApiResponse({ status: 204, description: "Notice deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Notice not found" })
  remove(@Param("id") id: number, @CurrentUser() user: JwtUser): Promise<void> {
    // Page References: Admin -> 공지사항 관리 -> Delete Action
    return this.noticesService.remove(id, user.userId);
  }
}
