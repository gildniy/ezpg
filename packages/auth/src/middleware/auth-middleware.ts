import { NextRequest, NextResponse } from "next/server";

import { AuthAppConfig } from "../types";

interface AuthMiddlewareConfig
  extends Pick<AuthAppConfig, "allowedRoles" | "redirects"> {
  publicPaths?: string[];
  authPaths?: string[];
}

// JWT token validation (simplified - you might want to use a proper JWT library)
function isValidToken(token: string): boolean {
  try {
    // Basic token validation - you should implement proper JWT validation
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    return payload.exp > now;
  } catch {
    return false;
  }
}

// Get user role from token
function getUserRole(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  return function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define default paths
    const publicPaths = config.publicPaths || [
      "/login",
      "/verify-tfa",
      "/change-password",
    ];
    const authPaths = config.authPaths || [
      "/login",
      "/verify-tfa",
      "/change-password",
    ];

    // Allow public paths
    if (publicPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Get token from cookies or headers
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    // No token - redirect to login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Invalid token - redirect to login
    if (!isValidToken(token)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }

    // Check role-based access
    if (config.allowedRoles && config.allowedRoles.length > 0) {
      const userRole = getUserRole(token);
      if (!userRole || !config.allowedRoles.includes(userRole)) {
        // User doesn't have required role
        const response = NextResponse.redirect(new URL("/login", request.url));
        return response;
      }
    }

    // For authenticated users on auth pages, redirect to dashboard
    if (authPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(
        new URL(config.redirects.afterLogin, request.url),
      );
    }

    // Allow access to protected paths
    return NextResponse.next();
  };
}

// Pre-configured middleware for admin app
export const adminAuthMiddleware = createAuthMiddleware({
  allowedRoles: ["ADMIN"],
  redirects: {
    afterLogin: "/",
    afterLogout: "/login",
  },
  publicPaths: ["/login", "/verify-tfa", "/change-password"],
  authPaths: ["/login", "/verify-tfa", "/change-password"],
});

// Pre-configured middleware for merchant app
export const merchantAuthMiddleware = createAuthMiddleware({
  allowedRoles: ["MERCHANT", "ADMIN"],
  redirects: {
    afterLogin: "/",
    afterLogout: "/login",
  },
  publicPaths: ["/login", "/verify-tfa", "/change-password"],
  authPaths: ["/login", "/verify-tfa", "/change-password"],
});
