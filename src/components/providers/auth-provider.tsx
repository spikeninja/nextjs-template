"use client"

import type { User } from "@/server/db/old-schema"
import { PropsWithChildren, useContext, createContext } from "react"

export interface AuthContextValue {
  user: User
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({
  children,
  user,
}: PropsWithChildren<{ user: User }>) {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}
