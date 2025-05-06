import { PropsWithChildren } from "react"

export default function Container({ children }: PropsWithChildren) {
  return (
    <div className="w-full max-w-[1200px] mx-auto my-0 p-[15px]">
      {children}
    </div>
  )
}
