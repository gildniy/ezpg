import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  AdminMerchantGroupsCreateDto,
  AdminMerchantGroupsQueryDto,
  AdminMerchantGroupsResponseDto,
} from "./dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { JwtUser } from "src/auth/interfaces/jwt-user.interface";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AdminMerchantGroupsService } from "./admin-merchant-groups.service";
import { PaginatedResponse } from "../../common/dto/paginated-response.dto";

@ApiTags("Admin - Merchant Groups")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/merchant-groups")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminMerchantGroupsController {
  constructor(
    private readonly merchantGroupsService: AdminMerchantGroupsService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new merchant group" })
  @ApiResponse({
    status: 201,
    description: "The merchant group has been successfully created.",
    type: AdminMerchantGroupsResponseDto,
  })
  create(
    @Body() createMerchantGroupDto: AdminMerchantGroupsCreateDto,
    @CurrentUser() user: JwtUser,
  ): Promise<AdminMerchantGroupsResponseDto> {
    return this.merchantGroupsService.create(createMerchantGroupDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Get all merchant groups" })
  @ApiResponse({
    status: 200,
    description: "List of merchant groups retrieved successfully",
    type: [AdminMerchantGroupsResponseDto],
  })
  findAll(
    @Query() query: AdminMerchantGroupsQueryDto,
    @CurrentUser() user: JwtUser,
  ): Promise<PaginatedResponse<AdminMerchantGroupsResponseDto>> {
    return this.merchantGroupsService.findAll(
      query.page,
      query.limit,
      query.skip,
      query.search,
      query.includeDeleted,
      query.onlyDeleted,
      user,
      query.viewAsAdminId,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a merchant group by ID" })
  @ApiResponse({
    status: 200,
    description: "The merchant group has been successfully retrieved.",
    type: AdminMerchantGroupsResponseDto,
  })
  findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<AdminMerchantGroupsResponseDto> {
    return this.merchantGroupsService.findOne(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a merchant group" })
  @ApiResponse({
    status: 204,
    description: "The merchant group has been successfully deleted.",
  })
  remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    return this.merchantGroupsService.remove(id, user);
  }
}
