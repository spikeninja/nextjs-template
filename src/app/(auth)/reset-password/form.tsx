"use client"

import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { resetPasswordAction } from "@/app/(auth)/actions"
import {
  type ResetPassword,
  resetPasswordSchema,
} from "@/app/(auth)/validation"

export function ResetPasswordForm({
  token,
  sessionId,
}: {
  token: string
  sessionId: number
}) {
  const { mutate } = useMutation({
    mutationKey: ["reset-password"],
    mutationFn: resetPasswordAction,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.payload.error, { position: "top-center" })
        return
      }
    },
  })

  const { handleSubmit, register } = useForm<ResetPassword>({
    defaultValues: {
      token,
      sessionId,
      newPassword: "",
      newPasswordRepeat: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit: SubmitHandler<ResetPassword> = (data) => {
    mutate(data)
  }

  return (
    <div className="text-center border-2 border-black p-8 rounded-xl">
      <h1 className="pb-4">Verify Email</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-[350px] gap-4"
      >
        <Input
          type="password"
          placeholder="New Password"
          {...register("newPassword")}
        />
        <Input
          type="password"
          placeholder="Repeat Password"
          {...register("newPasswordRepeat")}
        />
        <Button type="submit">Reset Password</Button>
      </form>
    </div>
  )
}
