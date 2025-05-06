import { z } from "zod"
import "dotenv/config"

const envSchema = z
  .object({
    APP_URL: z.string(),

    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),

    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),

    RESET_PASSWORD_TOKEN_MINUTES: z.coerce.number(),
    RESET_PASSWORD_MAX_ATTEMPTS_PER_DAY: z.coerce.number(),

    TURNSTILE_SECRET_KEY: z.string(),
    CAPTCHA_PASS_TOKEN: z.string(),

    SMTP_PORT: z.coerce.number(),
    SMTP_SERVER: z.string(),
    SMTP_EMAIL: z.string(),
    SMTP_PASSWORD: z.string(),
  })
  .transform((obj) => ({
    appUrl: obj.APP_URL,

    resetPasswordTokenMinutes: obj.RESET_PASSWORD_TOKEN_MINUTES,
    resetPasswordMaxAttemptsPerDay: obj.RESET_PASSWORD_MAX_ATTEMPTS_PER_DAY,

    redisHost: obj.REDIS_HOST,
    redisPort: obj.REDIS_PORT,

    smtpPort: obj.SMTP_PORT,
    smtpEmail: obj.SMTP_EMAIL,
    smtpServer: obj.SMTP_SERVER,
    smtpPassword: obj.SMTP_PASSWORD,

    databaseURL: `postgresql://${obj.POSTGRES_USER}:${obj.POSTGRES_PASSWORD}@${obj.POSTGRES_HOST}:${obj.POSTGRES_PORT}/${obj.POSTGRES_DB}?schema=public`,

    turnstileSecretKey: obj.TURNSTILE_SECRET_KEY,

    max_verification_attempts: 3,
    max_regeneration_attempts: 3,
    code_lifetime: 15 * 60 * 1000, // 15 minutes,
    regenration_window: 60 * 60 * 1000, // 1 hour

    captchaPassToken: obj.CAPTCHA_PASS_TOKEN,
  }))

export const settings = envSchema.parse(process.env)
