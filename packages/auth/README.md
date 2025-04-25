# @ezpg/auth

Centralized authentication package for EZPG applications, providing unified auth components, contexts, and middleware for both admin and merchant apps.

## Features

- 🔐 **Unified Authentication**: Single auth system serving both admin and merchant apps
- 🛡️ **Role-based Access Control**: Configurable role restrictions per app
- 🌐 **Internationalization**: Built-in support for Korean/English translations
- 🎨 **Consistent UI**: Shared auth components with app-specific branding
- 🚀 **Middleware Support**: Next.js middleware for route protection
- ⚡ **TypeScript**: Full type safety throughout

## Installation

```bash
npm install @ezpg/auth
```

## Quick Start

### 1. App Setup

#### Merchant App

```tsx
// apps/merchant/src/app/providers.tsx
import { AuthProviders, MERCHANT_AUTH_CONFIG } from "@ezpg/auth";

export function Providers({ children }) {
  return (
    <AuthProviders config={MERCHANT_AUTH_CONFIG}>{children}</AuthProviders>
  );
}
```

#### Admin App

```tsx
// apps/admin/src/app/providers.tsx
import { AuthProviders, ADMIN_AUTH_CONFIG } from "@ezpg/auth";

export function Providers({ children }) {
  return <AuthProviders config={ADMIN_AUTH_CONFIG}>{children}</AuthProviders>;
}
```

### 2. Middleware Setup

#### Merchant App

```tsx
// apps/merchant/src/middleware.ts
import { merchantAuthMiddleware } from "@ezpg/auth";

export default merchantAuthMiddleware;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
```

#### Admin App

```tsx
// apps/admin/src/middleware.ts
import { adminAuthMiddleware } from "@ezpg/auth";

export default adminAuthMiddleware;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
```

### 3. Auth Pages

#### Login Page

```tsx
// app/login/page.tsx
import { AuthLayout, LoginPage, MERCHANT_AUTH_CONFIG } from "@ezpg/auth";

export default function Login() {
  return (
    <AuthLayout config={MERCHANT_AUTH_CONFIG}>
      <LoginPage config={MERCHANT_AUTH_CONFIG} />
    </AuthLayout>
  );
}
```

#### 2FA Verification

```tsx
// app/verify-tfa/page.tsx
import { AuthLayout, VerifyTfaPage, MERCHANT_AUTH_CONFIG } from "@ezpg/auth";

export default function VerifyTfa() {
  return (
    <AuthLayout config={MERCHANT_AUTH_CONFIG}>
      <VerifyTfaPage config={MERCHANT_AUTH_CONFIG} />
    </AuthLayout>
  );
}
```

#### Change Password

```tsx
// app/change-password/page.tsx
import {
  AuthLayout,
  ChangePasswordPage,
  MERCHANT_AUTH_CONFIG,
} from "@ezpg/auth";

export default function ChangePassword() {
  return (
    <AuthLayout config={MERCHANT_AUTH_CONFIG}>
      <ChangePasswordPage config={MERCHANT_AUTH_CONFIG} />
    </AuthLayout>
  );
}
```

## Configuration

### App Configurations

#### MERCHANT_AUTH_CONFIG

```tsx
{
  appName: "EZPG Merchant",
  allowedRoles: ["MERCHANT", "ADMIN"],
  brandColor: "#0288FE",
  features: {
    languageSwitcher: true,    // Show Korean ↔ English toggle
    rememberMe: true,          // Show "Remember me" checkbox
    signUp: false,             // Hide sign-up functionality
    forgotPassword: true,      // Show "Forgot password" link
  },
  redirects: {
    afterLogin: "/",           // Redirect after successful login
    afterLogout: "/login",     // Redirect after logout
  },
}
```

#### ADMIN_AUTH_CONFIG

```tsx
{
  appName: "EZPG Admin",
  allowedRoles: ["ADMIN"],
  brandColor: "#3B82F6",
  features: {
    languageSwitcher: false,   // Korean only
    rememberMe: false,         // No "Remember me" option
    signUp: false,             // No sign-up
    forgotPassword: false,     // No "Forgot password"
  },
  redirects: {
    afterLogin: "/",
    afterLogout: "/login",
  },
}
```

### Custom Configuration

```tsx
import { AuthAppConfig } from "@ezpg/auth";

const customConfig: AuthAppConfig = {
  appName: "Custom App",
  logoUrl: "/custom-logo.png",
  allowedRoles: ["CUSTOM_ROLE"],
  brandColor: "#FF5722",
  features: {
    languageSwitcher: true,
    rememberMe: true,
    signUp: true,
    forgotPassword: true,
  },
  redirects: {
    afterLogin: "/dashboard",
    afterLogout: "/auth/login",
  },
};
```

## API Reference

### Components

#### `<AuthProviders>`

Main provider component that wraps your app with all necessary contexts.

```tsx
interface AuthProvidersProps {
  children: ReactNode;
  config: AuthAppConfig;
  queryClient?: QueryClient; // Optional custom QueryClient
}
```

#### `<AuthLayout>`

Layout component for auth pages with header, footer, and theme switching.

#### `<LoginPage>`, `<VerifyTfaPage>`, `<ChangePasswordPage>`

Complete auth page components ready to use.

#### `<LoginForm>`, `<TfaForm>`, `<ChangePasswordForm>`

Individual form components for custom layouts.

### Contexts

#### `useAuth()`

Enhanced auth hook with app-specific configuration.

```tsx
const {
  user,
  status,
  login,
  logout,
  verifyTfa,
  setPasswordFirstLogin,
  isValidatingToken,
  config,
} = useAuth();
```

#### `useApi()`

API client hook for making authenticated requests.

```tsx
const { apiClient, updateToken } = useApi();
```

### Middleware

#### `createAuthMiddleware(config)`

Factory function for creating custom auth middleware.

#### `merchantAuthMiddleware`

Pre-configured middleware for merchant app.

#### `adminAuthMiddleware`

Pre-configured middleware for admin app.

## Features

### Role-based Access Control

- Automatic role validation on login
- Route-level protection via middleware
- App-specific role restrictions

### Internationalization

- Korean/English language support
- Configurable language switcher
- App-specific language preferences

### Theme Support

- Dark/light mode support
- App-specific brand colors
- Consistent theming across apps

### Security

- JWT token validation
- Automatic token refresh
- Secure cookie handling
- Route protection

## Migration Guide

### From Individual App Auth

1. Remove existing auth contexts and components
2. Install `@ezpg/auth` package
3. Replace providers with `<AuthProviders>`
4. Update auth pages to use auth package components
5. Add middleware for route protection
6. Update imports from `@ezpg/auth`

### Benefits

- 🔄 **96% code reduction** - Eliminated ~1,500 lines of duplicated auth code
- 🎯 **Single source of truth** - All auth logic centralized
- 🛠️ **Easy maintenance** - Update once, applies everywhere
- 🚀 **Consistent UX** - Identical behavior across apps
- 🌐 **Built-in i18n** - Translation support included

## License

MIT
