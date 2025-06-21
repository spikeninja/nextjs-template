import { z } from "zod"

export const getAllUsersRequest = z.object({
  limit: z.coerce.number(),
  offset: z.coerce.number(),
})
