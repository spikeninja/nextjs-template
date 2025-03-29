"use client"

import { useStore } from "zustand"
import { createContext, useContext, PropsWithChildren, useRef } from "react"
import { type AuthStore, createAuthStore } from "@/store/auth-store"

export type AuthStoreApi = ReturnType<typeof createAuthStore>

export const AuthStoreContext = createContext<AuthStoreApi | undefined>(
  undefined
)

export const AuthStoreProvider = ({ children }: PropsWithChildren) => {
  const storeRef = useRef<AuthStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createAuthStore()
  }
  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  )
}

export const useAuthStore = <T,>(selector: (store: AuthStore) => T): T => {
  const authStoreContext = useContext(AuthStoreContext)

  if (!authStoreContext) {
    throw new Error(`useAuthStore must be used within AuthStoreProvider`)
  }

  return useStore(authStoreContext, selector)
}
