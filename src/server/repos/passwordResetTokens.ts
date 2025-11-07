import { DB } from "@/server/db"
import { settings } from "@/config/envs"
import { and, count, eq, gte } from "drizzle-orm"
import { hashPassword, utcNow } from "@/lib/security"
import { passwordResetTokensTable } from "@/server/db/old-schema"

export class PasswordResetTokensRepository {
  constructor(private readonly db: DB) {}

  async getById(id: number) {
    return await this.db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.id, id))
  }

  async getNumberOfTokens({
    userId,
    minutes,
  }: {
    userId: number
    minutes: number
  }) {
    const now = await utcNow()
    return this.db
      .select({ count: count() })
      .from(passwordResetTokensTable)
      .where(
        and(
          gte(
            passwordResetTokensTable.createdAt,
            now.subtract(minutes, "minutes").toDate()
          ),
          eq(passwordResetTokensTable.userId, userId)
        )
      )
  }

  async setAllTokensAsUsed(userId: number) {
    return this.db
      .update(passwordResetTokensTable)
      .set({ used: true })
      .where(eq(passwordResetTokensTable.userId, userId))
  }

  async create({ token, userId }: { token: string; userId: number }) {
    const now = await utcNow()
    const hashedToken = await hashPassword(token)
    const expiresAt = now.add(settings.resetPasswordTokenMinutes, "minutes")

    return this.db
      .insert(passwordResetTokensTable)
      .values({
        userId,
        hashedToken,
        expiresAt: expiresAt.toDate(),
        used: false,
      })
      .returning()
  }

  async update(
    id: number,
    values: {
      used: boolean
    }
  ) {
    return this.db
      .update(passwordResetTokensTable)
      .set(values)
      .where(eq(passwordResetTokensTable.id, id))
  }
}
