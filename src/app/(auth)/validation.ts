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

export const verifyEmailSchema = z.object({
  userId: z.number(),
  code: z.string().min(8).max(8),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  sessionId: z.number(),
  newPassword: z.string().min(8),
  newPasswordRepeat: z.string().min(8),
})
