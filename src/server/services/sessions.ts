import { base32 } from "rfc4648"
import { eq } from "drizzle-orm"
import { createHash } from "node:crypto"
import {
  type User,
  type Session,
  sessionsTable,
  usersTable,
} from "@/server/db/schema"
import { type DB } from "@/server/db"

// const TOKEN_BYTES = 20 as const
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days
const RENEW_THRESHOLD = SESSION_TTL_MS / 2 // 15 days

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null }

export class SessionService {
  private static readonly baseCookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  }

  constructor(private readonly db: DB) {}

  public static hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex")
  }

  public static calcExpiry(session_ttl_ms: number): Date {
    return new Date(Date.now() + session_ttl_ms)
  }

  static generateSessionToken() {
    const bytes = new Uint8Array(20)
    crypto.getRandomValues(bytes)
    return base32.stringify(bytes)
  }

  async createSession(token: string, userId: number): Promise<Session> {
    const session = {
      userId,
      id: SessionService.hashToken(token),
      expiresAt: SessionService.calcExpiry(SESSION_TTL_MS),
    }
    const [dbSession] = await this.db
      .insert(sessionsTable)
      .values(session)
      .returning()
    return dbSession
  }

  async validateSessionToken(token: string): Promise<SessionValidationResult> {
    const now = Date.now()
    const sessionId = SessionService.hashToken(token)

    const result = await this.db
      .select({ user: usersTable, session: sessionsTable })
      .from(sessionsTable)
      .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
      .where(eq(sessionsTable.id, sessionId))

    if (result.length < 1) {
      return { session: null, user: null }
    }
    const { user, session } = result[0]
    if (now >= session.expiresAt.getTime()) {
      await this.invalidateSession(session.id)
      return { session: null, user: null }
    }

    if (now >= session.expiresAt.getTime() - RENEW_THRESHOLD) {
      session.expiresAt = SessionService.calcExpiry(SESSION_TTL_MS)
      await this.db
        .update(sessionsTable)
        .set({
          expiresAt: session.expiresAt,
        })
        .where(eq(sessionsTable.id, session.id))
    }
    return { session, user }
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
  }

  async invalidateAllSessions(userId: number): Promise<void> {
    await this.db.delete(sessionsTable).where(eq(sessionsTable.userId, userId))
  }

  async setSessionTokenCookie(
    { token, expiresAt }: { token: string; expiresAt: Date },
    set: (token: string, data: Record<string, unknown>) => void
  ): Promise<void> {
    set(token, { ...SessionService.baseCookie, expires: expiresAt })
  }

  async deleteSessionTokenCookie(
    unset: (data: Record<string, unknown>) => void
  ): Promise<void> {
    unset({ ...SessionService.baseCookie, maxAge: 0 })
  }
}
