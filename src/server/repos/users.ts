import { db } from "@/db"
import { usersTable } from "@/db/schema"
import { hashPassword } from "@/lib/security"
import { eq } from "drizzle-orm"

class UsersRepository {
  async create(obj: { name: string; hashedPassword: string; email: string }) {
    return await db.insert(usersTable).values(obj).returning()
  }
  async getById(id: number) {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))

    return result[0]
  }
  async getByEmail(email: string) {
    const result = await db
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
    return db
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
    return db
      .update(usersTable)
      .set({ hashedPassword })
      .where(eq(usersTable.id, id))
  }
}

export const usersRepository = new UsersRepository()
