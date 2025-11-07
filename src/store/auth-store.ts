import { type User } from "@/server/db/old-schema"
import { createStore } from "zustand/vanilla"

export type AuthStoreState = {
  isLoggedIn: boolean
  user: User | null
  userId: number | null
}

export type AuthStoreActions = {
  setUserId: (userId: number) => void
  setLogin: (token: string, user: User) => void
  setLogout: () => void

  login: (token: string, user: User) => void
  logout: () => void
}

export type AuthStore = AuthStoreState & AuthStoreActions

export const defaultInitState: AuthStoreState = {
  user: null,
  userId: null,
  isLoggedIn: false,
}

export const createAuthStore = (
  initState: AuthStoreState = defaultInitState
) => {
  return createStore<AuthStore>()((set, get) => ({
    ...initState,
    setLogin: (token: string, user: User) => set({ user, isLoggedIn: true }),
    setLogout: () => set({ user: null, isLoggedIn: false, userId: null }),

    setUserId: (userId: number) => set({ userId }),

    login: (token: string, user: User) => {
      const { setLogin } = get()
      setLogin(token, user)
      localStorage.setItem("@token", token)
    },

    logout: () => {
      const { setLogout } = get()
      setLogout()
      localStorage.removeItem("@token")
    },
  }))
}
