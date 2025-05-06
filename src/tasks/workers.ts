import { Job, Worker } from "bullmq"
import { redisConn } from "@/tasks/redis"
import { tasksQueue } from "@/tasks/queue"
import { jobProcessors } from "@/tasks/tasks"

export const mainWorker = new Worker(
  tasksQueue.name,
  async (job: Job) => {
    const processor = jobProcessors[job.name as keyof typeof jobProcessors]
    if (processor) {
      console.log(`Processing job ${job.id} with name ${job.name}`)
      return processor(job.data)
    } else {
      console.error(`No processor found for job name: ${job.name}`)
      throw new Error(`No processor found for job name: ${job.name}`)
    }
  },
  {
    connection: redisConn,
  }
)

mainWorker.on(
  "completed",
  (job: Job, returnvalue: { success: boolean } | unknown) => {
    console.log(
      `Job ${job.id} completed for ${job.name} with result:`,
      returnvalue
    )
  }
)

mainWorker.on("failed", (job: Job | undefined, error: Error) => {
  console.error(`Job ${job?.id} failed for ${job?.name}:`, error)
})

process.on("SIGINT", async () => {
  console.info("SIGINT signal received: closing worker")
  await mainWorker.close()
  console.info("Worker closed")
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.info("SIGTERM signal received: closing worker")
  await mainWorker.close()
  console.info("Worker closed")
  process.exit(0)
})

console.log(`Worker started for queue: ${tasksQueue.name}...`)
