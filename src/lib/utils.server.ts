import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { redirects } from "@/lib/constants"
import { redirect } from "next/navigation"
import { validateSessionToken } from "@/lib/sessions"

export const getUser = cache(async () => {
  const cookieStorage = await cookies()
  const sessionToken = cookieStorage.get("session")?.value
  if (!sessionToken) return null

  const { user } = await validateSessionToken(sessionToken)
  return user
})

export async function ensureAuthenticated() {
  const user = await getUser()
  if (!user) {
    throw redirect(redirects.toLogin)
  }

  return user
}
