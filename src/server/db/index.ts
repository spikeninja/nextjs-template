import "dotenv/config"
import { Pool } from "pg"
import { settings } from "@/config/envs"
import { drizzle } from "drizzle-orm/node-postgres"

const pool = new Pool({
  connectionString: settings.databaseURL,
})

export const db = drizzle({ client: pool })
export type DB = typeof db
