import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Function to check if a route should be protected
function isProtectedRoute(pathname: string): boolean {
  // Routes that don't need authentication (public routes)
  const publicRoutes = ["/login", "/verify-tfa", "/change-password"];

  // API routes that don't need authentication
  const publicApiRoutes = [
    "/api/v1/auth/login",
    "/api/v1/auth/verify-tfa",
    "/api/v1/auth/refresh",
  ];

  // Check if it's a public route
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return false;
  }

  // Check if it's a public API route
  if (
    publicApiRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return false;
  }

  // All other routes require authentication
  return true;
}

// More thorough function to check if user is authenticated based on cookies
function isAuthenticated(request: NextRequest): boolean {
  // Check for access token cookie - this is the primary auth cookie
  const hasAccessToken = request.cookies.has("access_token");

  // Special handling for logout - always treat as not authenticated
  const isLogoutRequest =
    request.nextUrl.pathname === "/api/v1/auth/logout" ||
    request.nextUrl.searchParams.has("_logout");
  const isAfterLogout = request.cookies.has("_logout_flag");

  // If we're in the logout flow, user should not be considered authenticated
  if (isLogoutRequest || isAfterLogout) {
    return false;
  }

  // Check for temp token (used during 2FA flow)
  const hasTempToken = request.cookies.has("temp_token");
  const isTfaRoute = request.nextUrl.pathname === "/verify-tfa";

  // Special case: Allow accessing 2FA verification page with temp token
  if (isTfaRoute && hasTempToken) {
    return true;
  }

  // For all other cases, require the access token
  return hasAccessToken;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware] Processing request to ${pathname}`);

  // ===== LOGOUT HANDLING =====
  // Check if this is a logout response by query parameter
  if (request.nextUrl.searchParams.has("_logout")) {
    console.log(`[Middleware] Handling logout redirect`);

    // Create a response that redirects to login
    const response = NextResponse.redirect(new URL("/login", request.url));

    // Set a temporary cookie to remember that we're in logout flow
    response.cookies.set("_logout_flag", "1", {
      maxAge: 5, // Very short-lived cookie
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Clear all auth-related cookies to ensure proper logout
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("temp_token");
    response.cookies.delete("first_login_token");

    console.log(`[Middleware] Redirecting to login after logout`);
    return response;
  }

  // Clear logout flag for subsequent requests
  if (request.cookies.has("_logout_flag")) {
    const response = NextResponse.next();
    response.cookies.delete("_logout_flag");
    return response;
  }

  // ===== AUTH STATE CHECKING =====
  // Check if user is authenticated
  const isUserAuthenticated = isAuthenticated(request);

  // Determine if this route requires authentication
  const routeRequiresAuth = isProtectedRoute(pathname);

  // Log the auth decision for debugging
  console.log(
    `[Middleware] Path: ${pathname}, Authenticated: ${isUserAuthenticated}, Requires Auth: ${routeRequiresAuth}`,
  );

  // ===== PROTECTED ROUTE ACCESS =====
  // If route requires auth and user is not authenticated, redirect to login
  if (routeRequiresAuth && !isUserAuthenticated) {
    console.log(
      `[Middleware] Unauthorized access attempt to ${pathname}, redirecting to login`,
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ===== PUBLIC ROUTE PROTECTION =====
  // If user is authenticated but trying to access public routes (e.g., login), redirect to dashboard
  // Exception: Don't redirect API routes even if authenticated
  if (
    !routeRequiresAuth &&
    isUserAuthenticated &&
    !pathname.startsWith("/api/")
  ) {
    console.log(
      `[Middleware] Authenticated user trying to access ${pathname}, redirecting to dashboard`,
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ===== CONTINUE NORMAL FLOW =====
  // Allow the request to proceed
  console.log(`[Middleware] Allowing request to ${pathname}`);
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
