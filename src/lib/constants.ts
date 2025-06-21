export const APP_TITLE = "Your Title"

export const redirects = {
  toLogin: "/login",
  toSignup: "/register",
  afterLogin: "/app",
  afterLogout: "/",
  toVerify: "/email-verify",
  afterVerify: "/app",
} as const

export const SESSION_COOKIE_NAME = "session"
