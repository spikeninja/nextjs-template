import { DB } from "@/server/db"
import { oneTimeCodesTable } from "@/server/db/old-schema"
import { eq, gt, sql, count, desc, and } from "drizzle-orm"

export class OneTimeCodesRepository {
  constructor(private readonly db: DB) {}

  async getLastCode({ userId }: { userId: number }) {
    const oneTimeCode = await this.db
      .select()
      .from(oneTimeCodesTable)
      .where(eq(oneTimeCodesTable.userId, userId))
      .orderBy(desc(oneTimeCodesTable.id))
      .limit(1)

    return oneTimeCode
  }

  async create({ userId, code }: { userId: number; code: string }) {
    return await this.db
      .insert(oneTimeCodesTable)
      .values({
        code,
        userId,
      })
      .returning()
  }

  async getAllAttempts({ userId, minDate }: { userId: number; minDate: Date }) {
    const [res] = await this.db
      .select({ count: count() })
      .from(oneTimeCodesTable)
      .where(
        and(
          eq(oneTimeCodesTable.userId, userId),
          gt(oneTimeCodesTable.generatedAt, minDate)
        )
      )

    return res.count
  }

  async increaseAttempts({ id }: { id: number }) {
    return await this.db
      .update(oneTimeCodesTable)
      .set({
        verificationAttempts: sql`${oneTimeCodesTable.verificationAttempts} + 1`,
      })
      .where(eq(oneTimeCodesTable.id, id))
  }

  async delete({ userId }: { userId: number }) {
    return await this.db
      .delete(oneTimeCodesTable)
      .where(eq(oneTimeCodesTable.userId, userId))
  }
}
