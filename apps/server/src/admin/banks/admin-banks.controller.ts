import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AdminBanksService } from "./admin-banks.service";
import {
  BankQueryDto,
  BankResponseDto,
  CreateBankDto,
  UpdateBankDto,
} from "./dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";
import { PaginatedResponse } from "../../common/dto/paginated-response.dto";
import { TfaSessionGuard } from "../../auth/guards/tfa-session.guard";
import { FirstLoginGuard } from "../../auth/guards/first-login.guard";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Admin - Banks")
@ApiBearerAuth("jwt-bearer-auth")
@Controller("admin/banks")
@UseGuards(JwtAuthGuard, TfaSessionGuard, FirstLoginGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminBanksController {
  constructor(private readonly banksService: AdminBanksService) {}

  @Post()
  @ApiOperation({ summary: "Create a new bank" })
  @ApiCreatedResponse({ type: BankResponseDto })
  create(
    @Body() createBankDto: CreateBankDto,
    @CurrentUser() user: JwtUser,
  ): Promise<BankResponseDto> {
    return this.banksService.create(createBankDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Get all banks with pagination" })
  @ApiOkResponse({ type: () => PaginatedResponse })
  findAll(
    @Query() query: BankQueryDto,
  ): Promise<PaginatedResponse<BankResponseDto>> {
    return this.banksService.findAll(query);
  }

  @Get(":code")
  @ApiOperation({ summary: "Get a bank by code" })
  @ApiParam({ name: "code", description: "Bank code" })
  @ApiOkResponse({ type: BankResponseDto })
  findOne(@Param("code") code: string): Promise<BankResponseDto> {
    return this.banksService.findOne(code);
  }

  @Patch(":code")
  @ApiOperation({ summary: "Update a bank" })
  @ApiParam({ name: "code", description: "Bank code" })
  @ApiOkResponse({ type: BankResponseDto })
  update(
    @Param("code") code: string,
    @Body() updateBankDto: UpdateBankDto,
    @CurrentUser() user: JwtUser,
  ): Promise<BankResponseDto> {
    return this.banksService.update(code, updateBankDto, user);
  }

  @Delete(":code")
  @ApiOperation({ summary: "Delete a bank" })
  @ApiParam({ name: "code", description: "Bank code" })
  @ApiOkResponse({ description: "Bank successfully deleted" })
  remove(
    @Param("code") code: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    return this.banksService.remove(code, user);
  }
}
