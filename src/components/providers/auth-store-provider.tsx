"use client"

import { useStore } from "zustand"
import { createContext, useContext, PropsWithChildren, useState } from "react"
import { type AuthStore, createAuthStore } from "@/store/auth-store"

export type AuthStoreApi = ReturnType<typeof createAuthStore>

export const AuthStoreContext = createContext<AuthStoreApi | undefined>(
  undefined
)

export const AuthStoreProvider = ({ children }: PropsWithChildren) => {
  const [store] = useState(() => createAuthStore())
  return (
    <AuthStoreContext.Provider value={store}>
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
