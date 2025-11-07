import { DB } from "@/server/db"
import { eq } from "drizzle-orm"
import { usersTable } from "@/server/db/old-schema"
import { hashPassword } from "@/lib/security"

export class UsersRepository {
  constructor(private readonly db: DB) {}

  async getAll({ limit, offset }: { limit: number; offset: number }) {
    return await this.db.select().from(usersTable).limit(limit).offset(offset)
  }
  async create(obj: { name: string; hashedPassword: string; email: string }) {
    return await this.db.insert(usersTable).values(obj).returning()
  }
  async getById(id: number) {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))

    return result[0]
  }
  async getByEmail(email: string) {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))

    return result[0]
  }

  async update(
    id: number,
    values: {
      name?: string
      bannedAt?: Date
      emailVerified?: boolean
    }
  ) {
    return this.db
      .update(usersTable)
      .set({
        ...values,
        updatedAt: new Date(new Date().toUTCString()),
      })
      .where(eq(usersTable.id, id))
  }

  async setNewPassword({
    id,
    newPassword,
  }: {
    id: number
    newPassword: string
  }) {
    const hashedPassword = await hashPassword(newPassword)
    return this.db
      .update(usersTable)
      .set({ hashedPassword })
      .where(eq(usersTable.id, id))
  }
}
