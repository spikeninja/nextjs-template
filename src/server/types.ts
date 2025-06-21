import { db } from "@/server/db"
import { User } from "@/server/db/schema"

export type ContextVariables = {
  db: typeof db
  user: User | null
}
