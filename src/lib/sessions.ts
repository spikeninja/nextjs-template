import { db } from "@/db"
import { base32 } from "rfc4648"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { createHash } from "node:crypto"
import { type User, type Session, sessionsTable, usersTable } from "@/db/schema"

export function generateSessionToken() {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = base32.stringify(bytes)
  return token
}

export async function createSession(
  token: string,
  userId: number
): Promise<Session> {
  const sessionId = createHash("sha256").update(token).digest("hex")
  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  }
  const [dbSession] = await db.insert(sessionsTable).values(session).returning()
  return dbSession
}

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = createHash("sha256").update(token).digest("hex")
  const result = await db
    .select({ user: usersTable, session: sessionsTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
    .where(eq(sessionsTable.id, sessionId))

  if (result.length < 1) {
    return { session: null, user: null }
  }
  const { user, session } = result[0]
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id))
    return { session: null, user: null }
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await db
      .update(sessionsTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionsTable.id, session.id))
  }
  return { session, user }
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
}

export async function invalidateAllSessions(userId: number): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId))
}

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  })
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null }
