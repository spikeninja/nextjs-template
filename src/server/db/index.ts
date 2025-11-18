import "dotenv/config"
import { Pool } from "pg"
import { envs } from "@/config/envs"
import { drizzle } from "drizzle-orm/node-postgres"

const pool = new Pool({
  connectionString: envs.databaseURL,
})

export const db = drizzle({ client: pool })
export type DB = typeof db
