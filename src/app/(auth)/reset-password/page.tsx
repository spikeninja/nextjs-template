"use client"

import { z } from "zod"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { resetPasswordAction, verifyEmailAction } from "@/app/(auth)/actions"
import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema } from "@/app/(auth)/validation"
import { SubmitHandler, useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"

type Inputs = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()

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

  const { handleSubmit, register } = useForm<Inputs>({
    defaultValues: {
      newPassword: "",
      newPasswordRepeat: "",
      token: searchParams.get("token") || "",
      sessionId: Number(searchParams.get("sessionId")) || -1,
    },
    resolver: zodResolver(resetPasswordSchema),
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
    </div>
  )
}
