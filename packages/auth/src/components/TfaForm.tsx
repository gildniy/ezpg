"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Input,
  toast,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  useTheme,
  useLanguage,
} from "@ezpg/ui";
import { useAuth } from "@ezpg/hooks";
import { AuthFormProps, TwoFactorFormValues } from "../types";

export function TfaForm({
  config,
  isLoading: externalLoading,
}: Omit<AuthFormProps, "t">) {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const { verifyTfa, isLoading: authLoading } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isLoading = externalLoading || authLoading;

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<TwoFactorFormValues>({
    defaultValues: {
      code: "",
    },
  });

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Update form value when code changes
  useEffect(() => {
    const fullCode = code.join("");
    setValue("code", fullCode);

    // Clear errors when the code is valid
    if (/^\d{6}$/.test(fullCode)) {
      clearErrors("code");
    }
  }, [code, setValue, clearErrors]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const digits = pastedText.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < 6; i++) {
        newCode[i] = digits[i] || "";
      }
      setCode(newCode);

      // Focus the next empty input or the last input
      const nextEmptyIndex = newCode.findIndex((digit) => digit === "");
      const targetIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[targetIndex]?.focus();
    }
  };

  const onSubmit = async (data: TwoFactorFormValues) => {
    if (!/^\d{6}$/.test(data.code)) {
      setError("code", {
        type: "manual",
        message: t("auth.tfa.error.required", "인증 코드를 입력해주세요"),
      });
      return;
    }

    try {
      await verifyTfa(data.code);
      // Redirect is handled by AuthProvider based on status
    } catch (error) {
      toast({
        title: t("auth.tfa.error.title", "인증 오류"),
        description:
          error instanceof Error
            ? error.message
            : t("auth.tfa.error.invalid", "잘못된 인증 코드입니다"),
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
          {t("auth.tfa.title", "2단계 인증")}
        </CardTitle>
        <CardDescription
          className={`text-center transition-colors duration-300 ease-in-out ${
            isDarkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {t("auth.tfa.subtitle", "인증 앱에서 확인 코드를 입력해주세요")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label
              className={`block text-sm font-medium transition-colors duration-300 ease-in-out ${
                isDarkMode ? "text-gray-200" : "text-gray-900"
              }`}
            >
              {t("auth.tfa.code.label", "인증 코드")}
            </label>
            <div className="flex justify-center space-x-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-12 text-center text-lg font-semibold transition-all duration-300 ease-in-out ${
                    isDarkMode
                      ? "bg-[#111827] border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } ${errors.code ? "border-red-300 dark:border-red-700" : ""}`}
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
            {errors.code && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {errors.code.message}
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
              : t("auth.tfa.submit", "확인")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
