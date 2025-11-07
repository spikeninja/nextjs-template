import { Hono } from "hono"
import { db } from "@/server/db"
import { auth } from "@/lib/auth"
import { usersApp } from "@/server/api/users"
import type { ContextVariables } from "@/server/types"

const app = new Hono<{ Variables: ContextVariables }>().basePath("/api")

app
  .use(async (c, next) => {
    c.set("db", db)
    return next()
  })
  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
  .route("/users", usersApp)

export type AppType = typeof app
export { app }
