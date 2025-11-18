import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { redirects } from "@/lib/constants"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    throw redirect(redirects.toLogin)
  }

  return <>{children}</>
}
