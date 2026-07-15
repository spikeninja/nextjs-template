import { envs } from "@/envs"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle",
  schema: "./src/server/db/schemas",
  dialect: "postgresql",
  dbCredentials: {
    url: envs.databaseURL,
  },
})
