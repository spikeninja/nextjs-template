import { envs } from "@/config/envs"

export const redisConn = {
  host: envs.redisHost,
  port: envs.redisPort,
  maxRetriesPerRequest: null,
}
