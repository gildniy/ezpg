import { SetMetadata } from "@nestjs/common";
import { RoleName } from "@ezpg/database"; // Import your Role enum/type

export const ROLES_KEY = "roles";
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
