"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock } from "lucide-react";
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
import { AuthFormProps, ChangePasswordFormValues } from "../types";

export function ChangePasswordForm({
  config,
  isLoading: externalLoading,
}: Omit<AuthFormProps, "t">) {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const { setPasswordFirstLogin, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });

  const isLoading = externalLoading || authLoading;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const onSubmit = async (data: ChangePasswordFormValues) => {
    // Manual validation
    let hasError = false;

    if (data.newPassword.length < 8) {
      setError("newPassword", {
        type: "manual",
        message: t(
          "auth.changePassword.error.minLength",
          "비밀번호는 8자 이상이어야 합니다.",
        ),
      });
      hasError = true;
    }

    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: t(
          "auth.changePassword.error.mismatch",
          "비밀번호가 일치하지 않습니다.",
        ),
      });
      hasError = true;
    }

    if (hasError) return;

    try {
      await setPasswordFirstLogin({ newPassword: data.newPassword });
      // Redirect is handled by AuthProvider based on status
    } catch (error) {
      toast({
        title: t("auth.changePassword.error.title", "비밀번호 변경 오류"),
        description:
          error instanceof Error
            ? error.message
            : t(
                "auth.common.error.generic",
                "비밀번호 변경 중 오류가 발생했습니다.",
              ),
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
          {t("auth.changePassword.title", "비밀번호 변경")}
        </CardTitle>
        <CardDescription
          className={`text-center transition-colors duration-300 ease-in-out ${
            isDarkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {t(
            "auth.changePassword.subtitle",
            "처음 로그인하셨습니다. 보안을 위해 비밀번호를 변경해주세요.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className={`transition-colors duration-300 ease-in-out ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
            >
              {t("auth.changePassword.newPassword.label", "새 비밀번호")}
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
                id="newPassword"
                type={showPassword.new ? "text" : "password"}
                autoComplete="new-password"
                className={`pl-10 pr-10 transition-all duration-300 ease-in-out ${
                  isDarkMode
                    ? "bg-[#111827] border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.newPassword ? "border-red-300 dark:border-red-700" : ""}`}
                placeholder={t(
                  "auth.changePassword.newPassword.placeholder",
                  "새 비밀번호를 입력해주세요",
                )}
                {...register("newPassword")}
                aria-invalid={errors.newPassword ? "true" : "false"}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPassword.new ? (
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
            {errors.newPassword && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.newPassword.message}
              </p>
            )}
            <p
              className={`text-xs transition-colors duration-300 ease-in-out ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t(
                "auth.changePassword.requirements",
                "비밀번호는 8자 이상이어야 하며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className={`transition-colors duration-300 ease-in-out ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
            >
              {t(
                "auth.changePassword.confirmPassword.label",
                "새 비밀번호 확인",
              )}
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
                id="confirmPassword"
                type={showPassword.confirm ? "text" : "password"}
                autoComplete="new-password"
                className={`pl-10 pr-10 transition-all duration-300 ease-in-out ${
                  isDarkMode
                    ? "bg-[#111827] border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.confirmPassword ? "border-red-300 dark:border-red-700" : ""}`}
                placeholder={t(
                  "auth.changePassword.confirmPassword.placeholder",
                  "새 비밀번호를 다시 입력해주세요",
                )}
                {...register("confirmPassword")}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPassword.confirm ? (
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
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

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
              : t("auth.changePassword.submit", "비밀번호 변경")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
