import * as z from "zod";

// Update the loginSchema to remove rememberMe
export const loginSchema = z.object({
  userId: z.string().min(1, { message: "사용자 ID를 입력해주세요." }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const twoFactorSchema = z.object({
  code: z
    .string()
    .min(6, { message: "6자리 코드를 입력해주세요." })
    .max(6, { message: "6자리 코드를 입력해주세요." })
    .regex(/^\d{6}$/, { message: "6자리 숫자 코드를 입력해주세요." }),
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

// Further simplified changePasswordSchema to fix type instantiation issues
export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "비밀번호는 8자 이상이어야 합니다." }),
    confirmPassword: z
      .string()
      .min(1, { message: "비밀번호 확인을 입력해주세요." }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "비밀번호가 일치하지 않습니다.",
        path: ["confirmPassword"],
      });
    }
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
