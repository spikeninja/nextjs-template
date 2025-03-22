export const APP_TITLE = "Your Title"

export const redirects = {
  toLogin: "/login",
  toSignup: "/register",
  afterLogin: "/home",
  afterLogout: "/",
  toVerify: "/verify-email",
  afterVerify: "/home",
} as const
