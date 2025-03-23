import { useSearchParams } from "next/navigation"
import { EmailVerifyForm } from "@/app/(auth)/email-verify/form"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center border-2 border-black p-8 rounded-xl">
        <h1 className="pb-4">Email Verify</h1>
        <EmailVerifyForm sessionId={Number(searchParams.get("sessionId"))} />
      </div>
    </div>
  )
}
