"use client";
import { useState } from "react";
import type React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgents } from "@/hooks/use-agents";
import { useToast } from "@ezpg/ui";
import { NotificationTime, NotificationType } from "@ezpg/database";
import Image from "next/image";

import { Button } from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { RadioGroup, RadioGroupItem } from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import { Checkbox } from "@ezpg/ui";

// Define the form schema using Zod
const agentFormSchema = z.object({
  agentUsername: z
    .string()
    .min(3, "에이전트 ID는 3자 이상이어야 합니다")
    .max(50, "에이전트 ID는 50자 이하여야 합니다"),
  agentName: z
    .string()
    .min(1, "에이전트명을 입력해주세요")
    .max(100, "에이전트명은 100자 이하여야 합니다"),
  merchantId: z
    .string()
    .min(4, "가맹점 ID는 4자 이상이어야 합니다")
    .max(8, "가맹점 ID는 8자 이하여야 합니다"),
  balance: z.number().min(0, "잔액은 0 이상이어야 합니다").default(0),
  bankName: z
    .string()
    .min(1, "은행을 선택해주세요")
    .max(100, "은행명은 100자 이하여야 합니다"),
  accountNumber: z
    .string()
    .min(1, "계좌번호를 입력해주세요")
    .max(50, "계좌번호는 50자 이하여야 합니다"),
  accountHolder: z
    .string()
    .min(1, "예금주명을 입력해주세요")
    .max(100, "예금주명은 100자 이하여야 합니다"),
  otpEnabled: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notificationTime: z
    .nativeEnum(NotificationTime)
    .default(NotificationTime.TWENTY_FOUR_HOURS),
  notificationTimeCustom: z.string().optional(),
  notificationTypes: z
    .array(z.nativeEnum(NotificationType))
    .default([NotificationType.PAYMENT_FAILED, NotificationType.SYSTEM_DOWN]),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

export function RegisterAgentContent() {
  const { toast } = useToast();
  const { createAgent } = useAgents();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      balance: 0,
      otpEnabled: false,
      isActive: true,
      notificationTime: NotificationTime.TWENTY_FOUR_HOURS,
      notificationTypes: [
        NotificationType.PAYMENT_FAILED,
        NotificationType.SYSTEM_DOWN,
      ],
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: AgentFormValues) => {
    try {
      // Convert the form data to match the API's expected format
      const apiData = {
        ...data,
        balance: data.balance.toString(), // Convert number to string for API
      };
      const response = await createAgent(apiData);
      if (response) {
        toast({
          title: "에이전트 등록 완료",
          description: "에이전트가 성공적으로 등록되었습니다.",
          variant: "default",
        });
        form.reset();
      }
    } catch (error) {
      toast({
        title: "에이전트 등록 실패",
        description: "에이전트 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 한국 은행 목록
  const banks = [
    "KB국민은행",
    "신한은행",
    "우리은행",
    "하나은행",
    "농협은행",
    "기업은행",
    "SC제일은행",
    "씨티은행",
    "카카오뱅크",
    "토스뱅크",
    "케이뱅크",
    "대구은행",
    "부산은행",
    "경남은행",
    "광주은행",
    "전북은행",
    "제주은행",
    "산업은행",
    "수협은행",
  ];

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">{"에이전트 등록"}</h2>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm"
      >
        <div className="grid gap-8">
          {/* 기본 정보 섹션 */}
          <div>
            <h3 className="text-md font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400">
              기본 정보
            </h3>
            <div className="grid gap-6">
              <div className="flex items-center">
                <div className="w-24 text-sm">에이전트 ID</div>
                <div className="flex-1 max-w-md">
                  <Input
                    {...form.register("agentUsername")}
                    placeholder="ezpgadmin"
                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  />
                  {form.formState.errors.agentUsername && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.agentUsername.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-24 text-sm">에이전트 PW</div>
                <div className="relative max-w-md w-full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                    value={form.watch("agentUsername")}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={
                      showPassword ? "비밀번호 숨기기" : "비밀번호 표시하기"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="ml-2 text-xs text-gray-500">
                  * 초기 비밀번호는 ID와 동일합니다
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-24 text-sm">에이전트명</div>
                <div className="flex-1 max-w-md">
                  <Input
                    {...form.register("agentName")}
                    placeholder="에이전트명을 입력하세요"
                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  />
                  {form.formState.errors.agentName && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.agentName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-24 text-sm">가맹점 ID</div>
                <div className="flex-1 max-w-md">
                  <Input
                    {...form.register("merchantId")}
                    placeholder="가맹점 ID를 입력하세요"
                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  />
                  {form.formState.errors.merchantId && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.merchantId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 수수료 출금은행 정보 섹션 */}
          <div>
            <h3 className="text-md font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-400">
              수수료 출금은행 정보
            </h3>
            <div className="grid gap-6">
              <div className="flex items-center">
                <div className="w-24 text-sm">은행</div>
                <div className="flex-1 max-w-md">
                  <Select
                    value={form.watch("bankName")}
                    onValueChange={(value) => form.setValue("bankName", value)}
                  >
                    <SelectTrigger className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                      <SelectValue placeholder="은행을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.bankName && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.bankName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-24 text-sm">계좌번호</div>
                <div className="flex-1 max-w-md">
                  <Input
                    {...form.register("accountNumber")}
                    placeholder="'-' 없이 입력하세요"
                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  />
                  {form.formState.errors.accountNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.accountNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-24 text-sm">예금주명</div>
                <div className="flex-1 max-w-md">
                  <Input
                    {...form.register("accountHolder")}
                    placeholder="송금시 송금인 정보"
                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  />
                  {form.formState.errors.accountHolder && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.accountHolder.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* OTP 사용여부 섹션 */}
          <div>
            <h3 className="text-md font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 text-purple-600 dark:text-purple-400">
              대시보드 로그인 OTP 설정
            </h3>
            <div className="grid gap-6">
              <div className="flex items-start">
                <div className="w-24 text-sm pt-2">OTP 사용여부</div>
                <div>
                  <RadioGroup
                    value={form.watch("otpEnabled") ? "yes" : "no"}
                    onValueChange={(value) =>
                      form.setValue("otpEnabled", value === "yes")
                    }
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="otp-yes" />
                      <Label htmlFor="otp-yes">사용</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="otp-no" />
                      <Label htmlFor="otp-no">미사용</Label>
                    </div>
                  </RadioGroup>

                  {form.watch("otpEnabled") && (
                    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md max-w-md">
                      <div className="text-sm mb-2">OTP QR 코드</div>
                      <div className="bg-white p-4 inline-block rounded-md">
                        <Image
                          src="/placeholder.svg?height=150&width=150"
                          alt="OTP QR Code"
                          width={150}
                          height={150}
                          className="h-[150px] w-[150px]"
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        * Google Authenticator 앱으로 QR 코드를 스캔하여 OTP를
                        설정하세요.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 mr-2"
            >
              확인
            </Button>
            <Button
              type="button"
              variant="outline"
              className="px-8"
              onClick={() => form.reset()}
            >
              취소
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
