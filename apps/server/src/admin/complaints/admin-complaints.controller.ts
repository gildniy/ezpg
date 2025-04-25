import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminComplaintsService } from "./admin-complaints.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { ComplaintQueryDto } from "./dto/complaint-query.dto";
// ... import guards, decorators, RoleName ...
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
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
import { RoleName } from "@ezpg/database";
import {
  ComplaintResponseDto,
  PaginatedComplaintsResponseDto,
} from "./dto/complaint-response.dto";
import { JwtUser } from "src/auth/interfaces/jwt-user.interface";

@ApiTags("Admin - Complaints")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/complaints")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminComplaintsController {
  constructor(private readonly complaintsService: AdminComplaintsService) {}

  @Post()
  @ApiOperation({
    summary: "Create Complaint",
    description: "Creates a new customer complaint record",
  })
  @ApiBody({ type: CreateComplaintDto })
  @ApiResponse({
    status: 201,
    description: "Complaint created successfully",
    type: ComplaintResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid input" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  create(
    @Body() dto: CreateComplaintDto,
    @CurrentUser("userId") adminuserId: string,
  ): Promise<ComplaintResponseDto> {
    // Page References: Admin -> 민원 관리 -> Create Action
    return this.complaintsService.create(
      dto,
      adminuserId,
    ) as Promise<ComplaintResponseDto>;
  }

  @Get()
  @ApiOperation({
    summary: "List Complaints",
    description:
      "Retrieves a paginated list of complaints with optional filtering",
  })
  @ApiQuery({ type: ComplaintQueryDto })
  @ApiResponse({
    status: 200,
    description: "List of complaints retrieved successfully",
    type: PaginatedComplaintsResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  findAll(
    @Query() query: ComplaintQueryDto,
  ): Promise<PaginatedResult<ComplaintResponseDto>> {
    // Page References: Admin -> 민원 관리
    return this.complaintsService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get Complaint Details",
    description: "Retrieves details of a specific complaint",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Complaint ID",
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: "Complaint details retrieved successfully",
    type: ComplaintResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Complaint not found" })
  findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ComplaintResponseDto> {
    // Page References: Admin -> 민원 관리 -> 상세보기
    return this.complaintsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update Complaint",
    description: "Updates status and resolution details of a complaint",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Complaint ID",
    example: 123,
  })
  @ApiBody({ type: UpdateComplaintDto })
  @ApiResponse({
    status: 200,
    description: "Complaint updated successfully",
    type: ComplaintResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - Invalid input" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Complaint not found" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() adminUser: JwtUser,
    @Body() dto: UpdateComplaintDto,
  ): Promise<ComplaintResponseDto> {
    // Page References: Admin -> 민원 관리 -> 상세보기 -> Update Action
    return this.complaintsService.update(id, dto, adminUser);
  }
}
