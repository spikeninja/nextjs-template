"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NavButton } from "@/components/NavButton"
import { HomeIcon, LogOutIcon } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

export function Header() {
  const router = useRouter()

  const { mutate } = useMutation({
    mutationKey: ["logout"],
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      router.push("/login")
    },
  })

  return (
    <header className="animate-slide bg-background h-12 p-2 border-b sticky top-0 z-20">
      <div className="flex h-8 items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <NavButton href="/app" label="Home" icon={HomeIcon} />
          <Link
            href="/app"
            className="flex justify-center items-center gap-2 ml-0"
            title="Home"
          >
            <h1 className="hidden sm:block text-xl font-bold m-0 mt-1">
              My Application
            </h1>
          </Link>
        </div>
        <div className="flex items-center">
          <Button
            onClick={() => mutate()}
            variant="ghost"
            className="cursor-pointer"
          >
            <LogOutIcon />
          </Button>
        </div>
      </div>
    </header>
  )
}
