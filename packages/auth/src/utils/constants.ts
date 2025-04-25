import { AuthAppConfig } from "../types";

// Default configuration for merchant app (user-facing, needs i18n)
export const MERCHANT_AUTH_CONFIG: AuthAppConfig = {
  appName: "EZPG Merchant",
  allowedRoles: ["MERCHANT", "ADMIN"],
  brandColor: "#0288FE",
  features: {
    languageSwitcher: true,
    rememberMe: true,
    signUp: false,
    forgotPassword: true,
  },
  redirects: {
    afterLogin: "/",
    afterLogout: "/login",
  },
};

// Default configuration for admin app (internal, Korean only)
export const ADMIN_AUTH_CONFIG: AuthAppConfig = {
  appName: "EZPG Admin",
  allowedRoles: ["ADMIN"],
  brandColor: "#3B82F6",
  features: {
    languageSwitcher: false,
    rememberMe: false,
    signUp: false,
    forgotPassword: false,
  },
  redirects: {
    afterLogin: "/",
    afterLogout: "/login",
  },
};
