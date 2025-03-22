"use client"

import { z } from "zod"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { verifyEmailAction } from "@/app/(auth)/actions"
import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { verifyEmailSchema } from "@/app/(auth)/validation"
import { SubmitHandler, useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type Inputs = z.infer<typeof verifyEmailSchema>

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()

  const { mutate } = useMutation({
    mutationKey: ["verify-email"],
    mutationFn: verifyEmailAction,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.payload.error, { position: "top-center" })
      }
    },
  })

  const { handleSubmit, setValue } = useForm<Inputs>({
    defaultValues: {
      code: "",
      userId: Number(searchParams.get("sessionId")),
    },
    resolver: zodResolver(verifyEmailSchema),
  })
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutate(data)
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center border-2 border-black p-8 rounded-xl">
        <h1 className="pb-4">Verify Email</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-[350px] gap-4"
        >
          <InputOTP maxLength={8} onChange={(e) => setValue("code", e)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
              <InputOTPSlot index={6} />
              <InputOTPSlot index={7} />
            </InputOTPGroup>
          </InputOTP>
          <Button type="submit">Verify</Button>
        </form>
      </div>
    </div>
  )
}
