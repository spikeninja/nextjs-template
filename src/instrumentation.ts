import { runMigrations } from "@/db/migrate"

export async function register() {
  if (process.env.NODE_ENV === "production") {
    runMigrations().catch(console.error)
  }
}
