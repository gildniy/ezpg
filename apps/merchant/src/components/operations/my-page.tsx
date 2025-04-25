"use client";

import type React from "react";
import { Button } from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { useLanguage } from "@ezpg/hooks";

export function MyPageContent() {
  const { t, language } = useLanguage();

  // 언어에 따른 텍스트 매핑
  const texts = {
    previousPassword: language === "en" ? "Current Password" : "이전비밀번호",
    newPassword: language === "en" ? "New Password" : "변경비밀번호",
    confirmPassword: language === "en" ? "Confirm Password" : "비밀번호확인",
    previousPasswordPlaceholder:
      language === "en" ? "Enter current password" : "이전비밀번호",
    newPasswordPlaceholder:
      language === "en" ? "Enter new password" : "변경비밀번호",
    confirmPasswordPlaceholder:
      language === "en" ? "Confirm new password" : "비밀번호확인",
    passwordChangeNote:
      language === "en"
        ? "Please enter your current password and new password. The new password must be at least 8 characters long and include numbers and special characters."
        : "현재 비밀번호와 새 비밀번호를 입력하세요. 새 비밀번호는 8자 이상이어야 하며 숫자와 특수 문자를 포함해야 합니다.",
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          {t("myPage")} / {t("passwordChange")}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 max-w-2xl text-gray-800 dark:text-gray-200">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <ChevronDownIcon className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-base font-medium">{t("passwordChange")}</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
            {texts.passwordChangeNote}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("id")}
            </label>
            <div className="text-sm">ezpgadmin</div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm font-medium">
              {texts.previousPassword}
            </label>
            <Input
              type="password"
              placeholder={texts.previousPasswordPlaceholder}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm font-medium">{texts.newPassword}</label>
            <Input
              type="password"
              placeholder={texts.newPasswordPlaceholder}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm font-medium">
              {texts.confirmPassword}
            </label>
            <Input
              type="password"
              placeholder={texts.confirmPasswordPlaceholder}
              className="max-w-md"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button className="bg-green-500 hover:bg-green-600 text-white px-8">
            {t("changePassword")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
