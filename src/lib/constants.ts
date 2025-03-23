export const APP_TITLE = "Your Title"

export const redirects = {
  toLogin: "/login",
  toSignup: "/register",
  afterLogin: "/app",
  afterLogout: "/",
  toVerify: "/email-verify",
  afterVerify: "/app",
} as const
