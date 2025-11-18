"use client"

import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import { type Register, registerSchema } from "@/app/(auth)/validation"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export default function RegisterForm() {
  const router = useRouter()
  const { mutate } = useMutation({
    mutationKey: ["register"],
    mutationFn: (data: Register) =>
      authClient.signUp.email({
        ...data,
      }),
    onSuccess: (response) => {
      if (response.error) {
        toast.error(response.error.message, { position: "top-center" })
      } else {
        router.push("/login")
      }
    },
  })

  const { register, handleSubmit } = useForm<Register>({
    resolver: zodResolver(registerSchema),
  })
  const onSubmit: SubmitHandler<Register> = (data) => {
    mutate(data)
  }

  return (
    <div className="text-center border-2 border-black p-8 rounded-xl">
      <h1 className="pb-4">Sign Up</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-[350px] gap-3"
      >
        <Input
          type="text"
          placeholder="Name"
          className="py-2 px-4"
          {...register("name")}
        />
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
        <Button type="submit">Sign Up</Button>
        <p>
          Already have an account? <Link href="/login">Sign In</Link>
        </p>
      </form>
    </div>
  )
}
