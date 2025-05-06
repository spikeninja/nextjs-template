"use client"

import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginAction } from "@/app/(auth)/actions"
import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { type Login, loginSchema } from "@/app/(auth)/validation"
import { SubmitHandler, useForm } from "react-hook-form"

export function LoginForm() {
  const { mutate: server_login } = useMutation({
    mutationKey: ["login"],
    mutationFn: loginAction,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.payload.error, { position: "top-center" })
      }
    },
  })

  const { register, handleSubmit } = useForm<Login>({
    resolver: zodResolver(loginSchema),
  })
  const onSubmit: SubmitHandler<Login> = (data) => {
    server_login(data)
  }

  return (
    <div className="text-center border-2 border-black p-8 rounded-xl">
      <h1 className="pb-4">Sign In</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-[350px] gap-4"
      >
        <Input
          type="text"
          placeholder="Email"
          className="py-2 px-4"
          {...register("email")}
        />
        <Input
          type="password"
          placeholder="Password"
          className="py-2 px-4"
          {...register("password")}
        />
        <Link href="/forgot-password">
          <p>Forgot Password?</p>
        </Link>
        <Button type="submit">Sign In</Button>
        <p>
          Don&apos;t have an account? <Link href="/register">Sign Up</Link>
        </p>
      </form>
    </div>
  )
}
