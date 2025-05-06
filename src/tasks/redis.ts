import { settings } from "@/config/envs"

export const redisConn = {
  host: settings.redisHost,
  port: settings.redisPort,
  maxRetriesPerRequest: null,
}
