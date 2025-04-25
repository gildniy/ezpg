export const AuthErrorCode = {
  TempTokenExpired: "TEMP_TOKEN_EXPIRED",
  TempTokenInvalid: "TEMP_TOKEN_INVALID",
  TempAuthFailed: "TEMP_AUTH_FAILED",
  TfaCodeInvalid: "TFA_CODE_INVALID",
  CredentialsInvalid: "CREDENTIALS_INVALID",
  RefreshTokenInvalid: "REFRESH_TOKEN_INVALID",
  AccessTokenInvalid: "ACCESS_TOKEN_INVALID",
} as const;

// Optional: Define a type for the values if needed elsewhere
export type AuthErrorCodeValue =
  (typeof AuthErrorCode)[keyof typeof AuthErrorCode];
