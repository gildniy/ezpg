"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUsers } from "@/hooks/use-user";
import { Button } from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { ChevronDownIcon } from "lucide-react";
import { User } from "@/hooks/use-user";

const schema = z
  .object({
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

interface MyPageProps {
  user: User | null;
}

export default function MyPage({ user }: MyPageProps) {
  const { updatePassword, isLoading, error } = useUsers();
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSuccess(false);
    if (!user) {
      return;
    }
    const ok = await updatePassword(user.userId, data.password);
    setSuccess(ok);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          {"마이페이지"} / {"비밀번호 변경"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 max-w-2xl text-gray-800 dark:text-gray-200">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <ChevronDownIcon className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-base font-medium">{"비밀번호 변경"}</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
            {
              "비밀번호는 8자 이상이어야 하며, 보안을 위해 정기적으로 변경해 주세요."
            }
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {"아이디"}
              </label>
              <div className="text-sm">{user?.username}</div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-sm font-medium">{"새 비밀번호"}</label>
              <Input
                type="password"
                placeholder={"새 비밀번호"}
                className="max-w-md"
                {...register("password")}
              />
              {errors.password && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </div>
              )}
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-sm font-medium">{"비밀번호 확인"}</label>
              <Input
                type="password"
                placeholder={"비밀번호 확인"}
                className="max-w-md"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white px-8"
              type="submit"
              disabled={isLoading}
            >
              {"비밀번호 변경"}
            </Button>
          </div>

          {success && (
            <div className="mt-4 text-green-500">
              {"비밀번호가 성공적으로 변경되었습니다."}
            </div>
          )}
          {error && <div className="mt-4 text-red-500">{error.message}</div>}
        </form>
      </div>
    </div>
  );
}
