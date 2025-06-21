import "server-only"

import { cache } from "react"
import { db } from "@/server/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { redirects } from "@/lib/constants"
import { SessionService } from "@/server/services/sessions"

export const getUser = cache(async () => {
  const cookieStorage = await cookies()
  const sessionService = new SessionService(db)
  const sessionToken = cookieStorage.get("session")?.value

  if (!sessionToken) return null

  const { user } = await sessionService.validateSessionToken(sessionToken)
  return user
})

export async function ensureAuthenticated() {
  const user = await getUser()
  if (!user) {
    throw redirect(redirects.toLogin)
  }

  return user
}
