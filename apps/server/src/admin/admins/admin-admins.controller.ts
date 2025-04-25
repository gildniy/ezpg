import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { AdminAdminsService } from "./admin-admins.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RoleName } from "@ezpg/database";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { JwtUser } from "../../auth/interfaces/jwt-user.interface";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateAdminDto } from "./dto/create-admin.dto";

@ApiTags("Admin - Admins")
@Controller("admin/admins")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminAdminsController {
  constructor(private readonly adminAdminsService: AdminAdminsService) {}

  /**
   * Create an Admin entity for an admin user
   *
   * @param adminId The ID of the admin user
   * @param dto DTO containing whether this admin is a super admin
   * @param user The current admin user
   * @returns The created Admin entity
   */
  @Post()
  @ApiOperation({ summary: "Create an Admin entity for an admin user" })
  @ApiResponse({
    status: 201,
    description: "The Admin entity has been created",
  })
  async createAdmin(
    @Param("adminId") adminId: string,
    @Body() dto: CreateAdminDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.adminAdminsService.createAdmin(
      adminId,
      dto.isSuperAdmin,
      user.userId,
    );
  }
}
