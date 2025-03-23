"use client"

import { toast } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { forgotPasswordAction } from "@/app/(auth)/actions"
import {
  type ForgotPassword,
  forgotPasswordSchema,
} from "@/app/(auth)/validation"
import { redirect } from "next/navigation"
import { redirects } from "@/lib/constants"

export function ForgotPasswordForm() {
  const { mutate } = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: forgotPasswordAction,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.payload.error, { position: "top-center" })
        return
      }
      toast.success("Check your email", { position: "top-center" })
      redirect(redirects.toLogin)
    },
  })

  const { handleSubmit, register } = useForm<ForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit: SubmitHandler<ForgotPassword> = (data) => {
    mutate(data)
  }

  return (
    <div className="text-center border-2 border-black p-8 rounded-xl">
      <h1 className="pb-4">Verify Email</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-[350px] gap-4"
      >
        <Input type="text" placeholder="Email" {...register("email")} />
        <Button type="submit">Reset Password</Button>
      </form>
    </div>
  )
}
