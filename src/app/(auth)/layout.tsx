import { redirects } from "@/lib/constants"
import { getUser } from "@/lib/utils.server"
import { redirect } from "next/navigation"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()
  if (user) redirect(redirects.afterLogin)

  return <>{children}</>
}
