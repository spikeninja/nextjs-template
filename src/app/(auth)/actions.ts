"use server"

import { redirects, SESSION_COOKIE_NAME } from "@/lib/constants"
import {
  loginSchema,
  registerSchema,
  emailVerifySchema,
  resetPasswordSchema,
} from "@/app/(auth)/validation"
import { db } from "@/server/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SessionService } from "@/server/services/sessions"
import {
  loginInteractor,
  registerInteractor,
  verifyEmailInteractor,
  logoutInteractor,
  forgotPasswordInteractor,
  resetPasswordInteractor,
} from "@/server/interactors/auth"
import { UsersRepository } from "@/server/repos/users"
import { OneTimeCodesRepository } from "@/server/repos/oneTimeCodes"
import { PasswordResetTokensRepository } from "@/server/repos/passwordResetTokens"

export async function loginAction(obj: { email: string; password: string }) {
  const cookieStore = await cookies()
  const sessionService = new SessionService(db)
  const usersRepository = new UsersRepository(db)

  const parsed = loginSchema.safeParse(obj)
  if (!parsed.success) {
    const err = parsed.error.flatten()
    return {
      success: false,
      payload: {
        error: "Validation Error",
        meta: {
          email: err.fieldErrors.email?.[0],
          password: err.fieldErrors.password?.[0],
        },
      },
    }
  }
  const { email, password } = parsed.data

  try {
    const session = await loginInteractor(sessionService, usersRepository, {
      email,
      password,
    })

    await sessionService.setSessionTokenCookie(
      { token: session.id, expiresAt: session.expiresAt },
      (token, data) => cookieStore.set(SESSION_COOKIE_NAME, token, data)
    )

    return redirect(redirects.afterLogin)
  } catch (err) {
    return {
      success: false,
      payload: {
        error: err,
        meta: null,
      },
    }
  }
}

export async function registerAction(obj: {
  email: string
  name: string
  password: string
}) {
  const usersRepository = new UsersRepository(db)
  const oneTimeCodeRepository = new OneTimeCodesRepository(db)

  const parsed = registerSchema.safeParse(obj)
  if (!parsed.success) {
    const err = parsed.error.flatten()
    return {
      success: false,
      payload: {
        error: "Validation Error",
        meta: {
          email: err.fieldErrors.email?.[0],
          password: err.fieldErrors.password?.[0],
        },
      },
    }
  }

  const { email, password, name } = parsed.data

  try {
    const { user } = await registerInteractor(
      usersRepository,
      oneTimeCodeRepository,
      { name, password, email }
    )
    return redirect(`${redirects.toVerify}?sessionId=${user.id}`)
  } catch (err) {
    return {
      success: false,
      paload: {
        error: err,
        meta: null,
      },
    }
  }
}

export async function verifyEmailAction(obj: { code: string; userId: number }) {
  const cookieStore = await cookies()
  const sessionService = new SessionService(db)
  const usersRepository = new UsersRepository(db)
  const oneTimeCodeRepository = new OneTimeCodesRepository(db)

  const parsed = emailVerifySchema.safeParse(obj)
  if (!parsed.success) {
    const err = parsed.error.flatten()
    return {
      success: false,
      payload: {
        error: "Validation Error",
        meta: {
          code: err.fieldErrors.code?.[0],
          userId: err.fieldErrors.userId?.[0],
        },
      },
    }
  }
  const { userId, code } = parsed.data
  try {
    const session = await verifyEmailInteractor(
      sessionService,
      usersRepository,
      oneTimeCodeRepository,
      { userId, code }
    )
    await sessionService.setSessionTokenCookie(
      { token: session.id, expiresAt: session.expiresAt },
      (token, data) => cookieStore.set(SESSION_COOKIE_NAME, token, data)
    )
    return redirect(redirects.afterVerify)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, payload: { error: message, meta: null } }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const sessionService = new SessionService(db)

  const token = cookieStore.get(SESSION_COOKIE_NAME)
  if (!token) {
    return {
      success: false,
      payload: {
        error: "You cannot perform this operation",
      },
    }
  }

  try {
    await logoutInteractor(sessionService, token.value)
    await sessionService.deleteSessionTokenCookie((data) => {
      cookieStore.set(SESSION_COOKIE_NAME, "", data)
    })
    return redirect(redirects.toLogin)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      payload: { error: message },
    }
  }
}

export async function forgotPasswordAction({ email }: { email: string }) {
  const usersRepository = new UsersRepository(db)
  const passwordResetTokensRepository = new PasswordResetTokensRepository(db)

  try {
    await forgotPasswordInteractor(
      usersRepository,
      passwordResetTokensRepository,
      { email }
    )

    return { success: true, payload: { error: null, meta: null } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, payload: { error: message, meta: null } }
  }
}

export async function resetPasswordAction(obj: {
  token: string
  sessionId: number
  newPassword: string
  newPasswordRepeat: string
}) {
  const usersRepository = new UsersRepository(db)
  const passwordResetTokensRepository = new PasswordResetTokensRepository(db)

  const parsed = resetPasswordSchema.safeParse(obj)
  if (!parsed.success) {
    const err = parsed.error.flatten()
    return {
      success: false,
      payload: {
        error: "Validation Error",
        meta: {
          token: err.fieldErrors.token?.[0],
          sessionId: err.fieldErrors.sessionId?.[0],
          newPassword: err.fieldErrors.newPassword?.[0],
          newPasswordRepeat: err.fieldErrors.newPasswordRepeat?.[0],
        },
      },
    }
  }

  try {
    await resetPasswordInteractor(
      usersRepository,
      passwordResetTokensRepository,
      parsed.data
    )
    return redirect(redirects.toLogin)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, payload: { error: message, meta: null } }
  }
}
