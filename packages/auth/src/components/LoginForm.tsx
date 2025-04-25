"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import {
  Input,
  Button,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
  useTheme,
  useLanguage,
} from "@ezpg/ui";
import { useAuth } from "@ezpg/hooks";
import { AuthFormProps, LoginFormValues } from "../types";

export function LoginForm({
  config,
  isLoading: externalLoading,
}: Omit<AuthFormProps, "t">) {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const { login, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const isLoading = externalLoading || authLoading;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Manual validation
    let hasError = false;

    if (!data.userId) {
      setError("userId", {
        type: "manual",
        message: t(
          "auth.login.error.required.userId",
          "사용자 ID를 입력해주세요.",
        ),
      });
      hasError = true;
    }

    if (!data.password) {
      setError("password", {
        type: "manual",
        message: t(
          "auth.login.error.required.password",
          "비밀번호를 입력해주세요.",
        ),
      });
      hasError = true;
    }

    if (hasError) return;

    try {
      await login({ username: data.userId, password: data.password });
      // Redirect is handled by AuthProvider based on status
    } catch (error) {
      toast({
        title: t("auth.login.error.title", "로그인 오류"),
        description:
          error instanceof Error
            ? error.message
            : t("auth.common.error.generic", "로그인 중 오류가 발생했습니다."),
        duration: 5000,
      });
    }
  };

  return (
    <Card
      className={`w-full max-w-md shadow-lg transition-all duration-300 ease-in-out ${
        isDarkMode ? "bg-[#1e2837] border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      <CardHeader className="space-y-1">
        <CardTitle
          className={`text-2xl font-bold text-center transition-colors duration-300 ease-in-out ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {t("auth.login.title", "로그인")}
        </CardTitle>
        <CardDescription
          className={`text-center transition-colors duration-300 ease-in-out ${
            isDarkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {t(
            "auth.login.subtitle",
            `${config.appName}에 오신 것을 환영합니다`,
          ).replace("{appName}", config.appName)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label
              htmlFor="userId"
              className={`transition-colors duration-300 ease-in-out ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
            >
              {t("auth.login.userId.label", "사용자 ID")}
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User
                  className={`h-5 w-5 transition-colors duration-300 ease-in-out ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
              </div>
              <Input
                id="userId"
                type="text"
                autoComplete="username"
                className={`pl-10 transition-all duration-300 ease-in-out ${
                  isDarkMode
                    ? "bg-[#111827] border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.userId ? "border-red-300 dark:border-red-700" : ""}`}
                placeholder={t(
                  "auth.login.userId.placeholder",
                  "사용자 ID를 입력해주세요",
                )}
                {...register("userId")}
                aria-invalid={errors.userId ? "true" : "false"}
              />
            </div>
            {errors.userId && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.userId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className={`transition-colors duration-300 ease-in-out ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
            >
              {t("auth.login.password.label", "비밀번호")}
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock
                  className={`h-5 w-5 transition-colors duration-300 ease-in-out ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`pl-10 pr-10 transition-all duration-300 ease-in-out ${
                  isDarkMode
                    ? "bg-[#111827] border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.password ? "border-red-300 dark:border-red-700" : ""}`}
                placeholder={t(
                  "auth.login.password.placeholder",
                  "비밀번호를 입력해주세요",
                )}
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff
                    className={`h-5 w-5 transition-colors duration-300 ease-in-out ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                ) : (
                  <Eye
                    className={`h-5 w-5 transition-colors duration-300 ease-in-out ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {config.features.rememberMe && (
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4"
                {...register("rememberMe")}
              />
              <Label htmlFor="rememberMe" className="text-sm">
                {t("auth.login.rememberMe", "로그인 상태 유지")}
              </Label>
            </div>
          )}

          <Button
            type="submit"
            className={`w-full transition-all duration-300 ease-in-out`}
            style={{
              backgroundColor: config.brandColor || "#3B82F6",
              color: "white",
            }}
            disabled={isLoading}
          >
            {isLoading
              ? t("auth.common.loading", "로딩 중...")
              : t("auth.login.submit", "로그인")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
