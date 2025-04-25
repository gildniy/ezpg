import { RoleName } from "@ezpg/database";

export interface JwtPayload {
  userId: string;
  role: RoleName;
  tfaVerified: boolean; // Indicates if TFA was completed for this token's session
  firstLoginPasswordChange?: boolean; // Indicates if this token is for first login password change only
  // Add other claims if needed (e.g., username)
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

// Refresh token payload might be simpler or identical
export interface RefreshTokenPayload {
  userId: string;
  role: RoleName; // Include role for consistency
  iat?: number;
  exp?: number;
}

export interface TempJwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// New interface for first login password change temporary token
export interface FirstLoginTempPayload {
  userId: string;
  firstLoginPasswordChange: boolean; // Always true for this type of token
  iat?: number;
  exp?: number;
}
