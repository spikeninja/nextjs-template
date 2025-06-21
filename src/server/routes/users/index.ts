import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { ContextVariables } from "@/server/types"
import { UsersRepository } from "@/server/repos/users"
import { getAllUsersRequest } from "@/server/routes/users/schemas"
import { authRequiredMiddleware } from "@/server/middleware"

export const usersApp = new Hono<{ Variables: ContextVariables }>()
usersApp.use(authRequiredMiddleware)

usersApp.get("/", zValidator("query", getAllUsersRequest), async (c) => {
  const db = c.get("db")
  const { limit, offset } = c.req.valid("query")
  const usersRepository = new UsersRepository(db)
  const users = await usersRepository.getAll({ limit, offset })

  return c.json({ users }, 200)
})
