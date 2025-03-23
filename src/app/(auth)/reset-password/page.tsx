import { ResetPasswordForm } from "@/app/(auth)/reset-password/form"

export default async function ResetPasswordPage(props: {
  // params: Promise<{ slug: string }>
  searchParams: Promise<{ token: string; sessionId: string }>
}) {
  const { token, sessionId } = await props.searchParams
  console.log("Params:", { token, sessionId })

  return (
    <div className="flex justify-center items-center h-screen">
      <ResetPasswordForm
        token={token || ""}
        sessionId={Number(sessionId) || -1}
      />
    </div>
  )
}
