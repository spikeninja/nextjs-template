"use client"

import { PropsWithChildren } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { getQueryClient } from "@/components/providers/query-client"

export function QueryProvider({ children }: PropsWithChildren) {
  // const [queryClient] = useState(() => new QueryClient())
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
