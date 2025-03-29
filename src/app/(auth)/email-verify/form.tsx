"use client"

import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { verifyEmailAction } from "@/app/(auth)/actions"
import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { type EmailVerify, emailVerifySchema } from "@/app/(auth)/validation"
import { SubmitHandler, useForm } from "react-hook-form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function EmailVerifyForm({ sessionId }: { sessionId: number }) {
  const { mutate } = useMutation({
    mutationKey: ["email-verify"],
    mutationFn: verifyEmailAction,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.payload.error, { position: "top-center" })
      }
    },
  })

  const { handleSubmit, setValue } = useForm<EmailVerify>({
    defaultValues: {
      code: "",
      userId: sessionId,
    },
    resolver: zodResolver(emailVerifySchema),
  })

  const onSubmit: SubmitHandler<EmailVerify> = (data) => {
    mutate(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-[350px] gap-4"
    >
      <InputOTP maxLength={8} onChange={(e) => setValue("code", e)}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <Button type="submit">Verify</Button>
    </form>
  )
}
