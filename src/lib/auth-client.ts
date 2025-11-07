import { settings } from "@/config/envs"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: settings.appUrl,
})
