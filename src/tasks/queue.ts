import { Queue } from "bullmq"
import { redisConn } from "@/tasks/redis"

export const tasksQueue = new Queue("default", {
  connection: redisConn,
  defaultJobOptions: {
    removeOnComplete: 500,
    removeOnFail: 1000,
  },
})
