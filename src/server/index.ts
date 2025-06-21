import { Hono } from "hono"
import type { ContextVariables } from "@/server/types"
import { usersApp } from "@/server/routes/users"
import { db } from "@/server/db"

const app = new Hono<{ Variables: ContextVariables }>().basePath("/api")

app.use(async (c, next) => {
  c.set("db", db)
  return next()
})

export const routes = app.route("/users", usersApp)
export type AppType = typeof app

export { app }
