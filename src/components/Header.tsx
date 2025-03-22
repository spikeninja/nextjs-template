import Link from "next/link"
import { HomeIcon, FileIcon, UsersRoundIcon } from "lucide-react"

import { NavButton } from "@/components/NavButton"

export function Header() {
  return (
    <header className="animate-slide bg-background h-12 p-2 border-b sticky top-0 z-20">
      <div className="flex h-8 items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <NavButton href="/home" label="Home" icon={HomeIcon} />
          <Link
            href="/home"
            className="flex justify-center items-center gap-2 ml-0"
            title="Home"
          >
            <h1 className="hidden sm:block text-xl font-bold m-0 mt-1">
              My Application
            </h1>
          </Link>
        </div>
        <div className="flex items-center">
          <NavButton href="/tickets" label="Tickets" icon={FileIcon} />
          <NavButton
            href="/customers"
            label="Customers"
            icon={UsersRoundIcon}
          />
        </div>
      </div>
    </header>
  )
}
