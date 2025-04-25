import { RoleName } from "@ezpg/database";

export interface JwtUser {
  userId: string;
  username: string;
  role: RoleName;
  tfaVerified: boolean;
  firstLogin: boolean;
  tfaSecret?: string;
  ipAddress?: string;
}
