import { Context, Next } from "hono"
import { ContextVariables } from "@/server/types"
import { SESSION_COOKIE_NAME } from "@/lib/constants"
import { deleteCookie, getCookie } from "hono/cookie"
import { SessionService } from "@/server/services/sessions"

export const authRequiredMiddleware = async (
  c: Context<{ Variables: ContextVariables }>,
  next: Next
) => {
  const db = c.get("db")
  const sessionService = new SessionService(db)

  const sessionToken = getCookie(c, SESSION_COOKIE_NAME)
  if (!sessionToken) {
    deleteCookie(c, SESSION_COOKIE_NAME)
    return c.json({ message: "Invalid Credentials" }, 401)
  }

  const { user } = await sessionService.validateSessionToken(sessionToken)
  if (!user) {
    deleteCookie(c, SESSION_COOKIE_NAME)
    await sessionService.invalidateSession(sessionToken)
    return c.json({ message: "Invalid Credentials" }, 401)
  }

  return next()
}
