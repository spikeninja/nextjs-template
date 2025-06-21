import { db } from "@/server/db"
import { migrate } from "drizzle-orm/node-postgres/migrator"

export async function runMigrations() {
  console.log("Migrations started...")
  await migrate(db, { migrationsFolder: "./drizzle" })
  console.log("Migrations are done")
}
