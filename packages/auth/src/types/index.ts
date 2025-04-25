// App configuration for different auth behaviors
export interface AuthAppConfig {
  appName: string;
  logoUrl?: string;
  // Role-based access
  allowedRoles?: string[];
  // Theming
  brandColor?: string;
  // Features
  features: {
    languageSwitcher: boolean;
    rememberMe: boolean;
    signUp: boolean;
    forgotPassword: boolean;
  };
  // Redirects
  redirects: {
    afterLogin: string;
    afterLogout: string;
  };
}

// Form component props
export interface AuthFormProps {
  config: AuthAppConfig;
  isLoading?: boolean;
}

// Login form specific
export interface LoginFormValues {
  userId: string;
  password: string;
  rememberMe?: boolean;
}

// 2FA form specific
export interface TwoFactorFormValues {
  code: string;
}

// Change password form specific
export interface ChangePasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}
