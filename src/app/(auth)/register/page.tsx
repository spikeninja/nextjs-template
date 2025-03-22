"use client"

import { z } from "zod"
import Link from "next/link"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { registerAction } from "@/app/(auth)/actions"
import { useMutation } from "@tanstack/react-query"
import { registerSchema } from "@/app/(auth)/validation"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"

type Inputs = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { mutate } = useMutation({
    mutationKey: ["register"],
    mutationFn: registerAction,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.payload.error, { position: "top-center" })
      }
    },
  })

  const { register, handleSubmit } = useForm<Inputs>({
    resolver: zodResolver(registerSchema),
  })
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutate(data)
  }

  return (
    <div className="flex justify-center items-center h-screen">
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
    </div>
  )
}
