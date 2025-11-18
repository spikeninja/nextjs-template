import crypto from "node:crypto"
import { envs } from "@/config/envs"
import { UsersRepository } from "@/server/repos/users"
import { SessionService } from "@/server/services/sessions"
import { sendEmailSMTP } from "@/server/services/emailSender"
import { OneTimeCodesRepository } from "@/server/repos/oneTimeCodes"
import { PasswordResetTokensRepository } from "@/server/repos/passwordResetTokens"
import { generateCode, hashPassword, verifyPasswords } from "@/lib/security"

export const loginInteractor = async (
  sessionService: SessionService,
  usersRepository: UsersRepository,
  values: { email: string; password: string }
) => {
  const { email, password } = values

  const user = await usersRepository.getByEmail(email)
  if (!user) {
    throw new Error("Invalid credentials")
  }

  const passwordsAreEqual = await verifyPasswords(password, user.hashedPassword)
  if (!passwordsAreEqual) {
    throw new Error("Invalid credentials")
  }

  const token = SessionService.generateSessionToken()
  return await sessionService.createSession(token, user.id)
}

export const registerInteractor = async (
  usersRepository: UsersRepository,
  oneTimeCodeRepository: OneTimeCodesRepository,
  values: { name: string; email: string; password: string }
) => {
  const { email, name, password } = values
  const user = await usersRepository.getByEmail(email)
  if (user) {
    throw new Error("User Already Exists")
  }

  const hashedPassword = await hashPassword(password)
  const result = await usersRepository.create({ name, email, hashedPassword })
  const dbUser = result[0]

  const code = await generateCode({ length: 6 })
  const verificationCode = await oneTimeCodeRepository.create({
    userId: dbUser.id,
    code,
  })

  if (process.env.NODE_ENV === "production") {
    await sendEmailSMTP({
      to: email,
      subject: "Verify your email",
      html: `Your verification code is: ${verificationCode}`,
      config: {
        port: envs.smtpPort,
        host: envs.smtpServer,
        auth: {
          email: envs.smtpEmail,
          pass: envs.smtpPassword,
        },
      },
    })
  } else {
    console.log(`Your verification code is ${verificationCode}`)
  }

  return { user: dbUser }
}

export const verifyEmailInteractor = async (
  sessionService: SessionService,
  usersRepository: UsersRepository,
  oneTimeCodeRepository: OneTimeCodesRepository,
  values: { code: string; userId: number }
) => {
  const { userId, code } = values
  const [oneTimeCode] = await oneTimeCodeRepository.getLastCode({ userId })

  if (oneTimeCode.verificationAttempts >= envs.max_verification_attempts) {
    throw new Error(
      "You've reached the limit of trying to enter the code. Login again to generate a new code"
    )
  }

  if (code === oneTimeCode.code) {
    await usersRepository.update(userId, { emailVerified: true })
    const token = SessionService.generateSessionToken()
    const session = await sessionService.createSession(token, userId)
    return session
  } else {
    await oneTimeCodeRepository.increaseAttempts({ id: oneTimeCode.id })
    const attemptsRemain =
      envs.max_verification_attempts - (oneTimeCode.verificationAttempts + 1)
    throw new Error(`Invalid code. Attempts Remain: ${attemptsRemain}`)
  }
}

export const logoutInteractor = async (
  sessionService: SessionService,
  token: string
) => {
  const { session } = await sessionService.validateSessionToken(token)
  if (!session) {
    throw new Error("No session found")
  }
  await sessionService.invalidateSession(session.id)
}

export const forgotPasswordInteractor = async (
  usersRepository: UsersRepository,
  passwordResetTokensRepository: PasswordResetTokensRepository,
  values: { email: string }
) => {
  const { email } = values
  const dbUser = await usersRepository.getByEmail(email)
  if (!dbUser) {
    throw new Error("You have no access to this resource")
  }

  const [tokensCount] = await passwordResetTokensRepository.getNumberOfTokens({
    userId: dbUser.id,
    minutes: 60 * 24,
  })

  if (tokensCount.count >= envs.resetPasswordMaxAttemptsPerDay) {
    throw new Error("You've reached the limit of trying to reset the password")
  }

  await passwordResetTokensRepository.setAllTokensAsUsed(dbUser.id)

  const token = crypto.randomBytes(32).toString("hex")
  const [dbToken] = await passwordResetTokensRepository.create({
    token,
    userId: dbUser.id,
  })

  const queryParams = { token, sessionId: dbToken.id.toString() }
  const params = new URLSearchParams(queryParams)
  const url = `${envs.appUrl}/reset-password?${params.toString()}`

  if (process.env.NODE_ENV === "production") {
    await sendEmailSMTP({
      to: email,
      subject: "Forgot Password",
      html: `Your link to restore the password is: ${url}`,
      config: {
        port: envs.smtpPort,
        host: envs.smtpServer,
        auth: {
          email: envs.smtpEmail,
          pass: envs.smtpPassword,
        },
      },
    })
  } else {
    const template = `URL to reset the password: ${url}`
    console.log("Template: ", template)
  }

  return { token, sessionId: dbToken.id }
}

export const resetPasswordInteractor = async (
  usersRepository: UsersRepository,
  passwordResetTokensRepository: PasswordResetTokensRepository,
  values: {
    token: string
    sessionId: number
    newPassword: string
    newPasswordRepeat: string
  }
) => {
  const { token, sessionId, newPassword, newPasswordRepeat } = values

  if (newPassword !== newPasswordRepeat) {
    throw new Error("Password and repeat password have to be equal")
  }

  const result = await passwordResetTokensRepository.getById(sessionId)
  if (result.length === 0) {
    throw new Error("Token is invalid")
  }
  const dbToken = result[0]

  const isVerified = await verifyPasswords(token, dbToken.hashedToken)
  if (!isVerified) {
    throw new Error("Token is invalid")
  }

  const now = new Date()
  if (now >= dbToken.expiresAt || dbToken.used) {
    throw new Error("Token has expired")
  }

  await usersRepository.setNewPassword({
    id: dbToken.userId,
    newPassword,
  })
  await passwordResetTokensRepository.update(dbToken.id, { used: true })
}
