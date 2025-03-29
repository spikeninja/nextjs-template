import { EmailVerifyForm } from "@/app/(auth)/email-verify/form"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center border-2 border-black p-8 rounded-xl">
        <h1 className="pb-4">Email Verify</h1>
        <EmailVerifyForm sessionId={Number(params.sessionId)} />
      </div>
    </div>
  )
}
