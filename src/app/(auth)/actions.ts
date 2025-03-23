"use server"

import crypto from "node:crypto"
import { redirects } from "@/lib/constants"
import {
  generateCode,
  hashPassword,
  utcNow,
  verifyPasswords,
} from "@/lib/security"
import {
  loginSchema,
  registerSchema,
  emailVerifySchema,
  resetPasswordSchema,
} from "@/app/(auth)/validation"
import {
  createSession,
  deleteSessionTokenCookie,
  generateSessionToken,
  invalidateSession,
  setSessionTokenCookie,
  validateSessionToken,
} from "@/lib/sessions"
import { cookies } from "next/headers"
import { settings } from "@/config/envs"
import { redirect } from "next/navigation"
import { usersRepository } from "@/server/repos/users"
import { oneTimeCodeRepository } from "@/server/repos/oneTimeCodes"
import { passwordResetTokensRepository } from "@/server/repos/passwordResetTokens"

export async function loginAction(obj: { email: string; password: string }) {
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

  const user = await usersRepository.getByEmail(email)
  if (!user) {
    return {
      success: false,
      payload: {
        error: "Invalid Credentials",
        meta: null,
      },
    }
  }
  const passwordsAreEqual = await verifyPasswords(password, user.hashedPassword)
  if (!passwordsAreEqual) {
    return {
      success: false,
      payload: {
        error: "Invalid Credentials",
        meta: null,
      },
    }
  }

  const now = new Date()
  const expTime = new Date()
  expTime.setDate(now.getDate() + 30)

  const token = generateSessionToken()
  await createSession(token, user.id)
  await setSessionTokenCookie(token, expTime)

  return redirect(redirects.afterLogin)
}

export async function registerAction(obj: {
  email: string
  name: string
  password: string
}) {
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

  const user = await usersRepository.getByEmail(email)
  if (user) {
    return {
      success: false,
      payload: {
        error: "User Already Exists",
        meta: null,
      },
    }
  }

  const hashedPassword = await hashPassword(password)
  const result = await usersRepository.create({ name, email, hashedPassword })
  console.log("Result: ", result)
  const dbUser = result[0]

  const code = await generateCode({ length: 8 })
  const verificationCode = await oneTimeCodeRepository.create({
    userId: dbUser.id,
    code,
  })
  console.log("VERIFICATION CODE: ", verificationCode)

  // await sendMail({
  //   to: email,
  //   subject: "Verify your email",
  //   body: renderVerificationCodeEmail({code: verificationCode.code})
  // })

  return redirect(`${redirects.toVerify}?sessionId=${dbUser.id}`)
}

export async function verifyEmailAction(obj: { code: string; userId: number }) {
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

  const [oneTimeCode] = await oneTimeCodeRepository.getLastCode({
    userId,
  })

  if (oneTimeCode.verificationAttempts >= settings.max_verification_attempts) {
    return {
      success: false,
      payload: {
        error:
          "You've reached the limit of trying to enter the code. Login again to generate a new code",
        meta: null,
      },
    }
  }

  const attemptsRemain =
    settings.max_verification_attempts - oneTimeCode.verificationAttempts

  if (code === oneTimeCode.code) {
    await usersRepository.update(userId, { emailVerified: true })

    const now = new Date()
    const expTime = new Date()
    expTime.setDate(now.getDate() + 30)

    const token = generateSessionToken()
    const session = await createSession(token, oneTimeCode.userId)
    await setSessionTokenCookie(session.id, expTime)

    return redirect(redirects.afterVerify)
  } else {
    await oneTimeCodeRepository.increaseAttempts({ id: oneTimeCode.id })

    return {
      success: false,
      payload: {
        error: `Invalid code. Attempts Remain: ${attemptsRemain}`,
        meta: null,
      },
    }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")
  if (!token) {
    return {
      success: false,
      payload: {
        error: "You cannot perform this operation",
      },
    }
  }

  const { session } = await validateSessionToken(token.value)
  if (!session) {
    return {
      success: false,
      payload: {
        error: "No session found",
      },
    }
  }

  // invalidateAllSessions?
  await invalidateSession(session.id)
  await deleteSessionTokenCookie()

  return redirect(redirects.toLogin)
}

export async function forgotPasswordAction({ email }: { email: string }) {
  // todo: implement
  const dbUser = await usersRepository.getByEmail(email)
  if (!dbUser) {
    return {
      success: false,
      payload: {
        error: "You have no access to this resource",
        meta: null,
      },
    }
  }

  const [tokensCount] = await passwordResetTokensRepository.getNumberOfTokens({
    userId: dbUser.id,
    minutes: 60 * 24,
  })

  if (tokensCount.count >= settings.resetPasswordMaxAttemptsPerDay) {
    return {
      success: false,
      payload: {
        error: "You've reached the limit of trying to reset the password",
        meta: null,
      },
    }
  }

  await passwordResetTokensRepository.setAllTokensAsUsed(dbUser.id)

  const token = crypto.randomBytes(32).toString("hex")
  const [dbToken] = await passwordResetTokensRepository.create({
    token,
    userId: dbUser.id,
  })

  const queryParams = {
    token: token,
    sessionId: dbToken.id.toString(),
  }
  const params = new URLSearchParams(queryParams)
  const url = `${settings.appUrl}/reset-password?${params.toString()}`

  // todo: later, add template render
  const template = `URL to reset the password: ${url}`
  console.log("TEmplate: ", template)

  return {
    success: true,
    payload: {
      error: null,
      meta: null,
    },
  }

  // TODO: send email with link
  // await sendEmail({
  //   to: userEmail,
  //   html: template.toString(),
  //   subject: 'PROJECT_NAME Password Reset',
  // })
}

export async function resetPasswordAction(obj: {
  token: string
  sessionId: number
  newPassword: string
  newPasswordRepeat: string
}) {
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

  const data = parsed.data

  if (data.newPassword !== data.newPasswordRepeat) {
    return {
      success: false,
      payload: {
        error: "Password and repeat password have to be equal",
        meta: null,
      },
    }
  }

  console.log("SESSIONID: ", data.sessionId)
  const result = await passwordResetTokensRepository.getById(data.sessionId)
  console.log("Result: ", result)
  if (result.length === 0) {
    return {
      success: false,
      payload: {
        error: "Token is invalid",
        meta: null,
      },
    }
  }
  const dbToken = result[0]

  const isVerified = await verifyPasswords(data.token, dbToken.hashedToken)
  if (!isVerified) {
    return {
      success: false,
      payload: {
        error: "Token is invalid",
        meta: null,
      },
    }
  }

  // TODO: what if user is deleted at this moment?

  const now = await utcNow()
  if (now.toDate() >= dbToken.expiresAt || dbToken.used) {
    return {
      success: false,
      payload: {
        error: "Token has expired",
        meta: null,
      },
    }
  }

  await usersRepository.setNewPassword({
    id: dbToken.userId,
    newPassword: data.newPassword,
  })

  await passwordResetTokensRepository.update(dbToken.id, { used: true })

  return redirect(redirects.toLogin)
}
