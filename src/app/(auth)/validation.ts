import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
})

export const emailVerifySchema = z.object({
  userId: z.number(),
  code: z.string().min(8).max(8),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  sessionId: z.number(),
  newPassword: z.string().min(8),
  newPasswordRepeat: z.string().min(8),
})

export type Login = z.infer<typeof loginSchema>
export type Register = z.infer<typeof registerSchema>
export type EmailVerify = z.infer<typeof emailVerifySchema>
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>
export type ResetPassword = z.infer<typeof resetPasswordSchema>
