import { ensureAuthenticated } from "@/lib/utils.server"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await ensureAuthenticated()
  return <>{children}</>
}
