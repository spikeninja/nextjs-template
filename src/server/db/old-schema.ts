import {
  integer,
  pgTable,
  varchar,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core"
import type { InferSelectModel } from "drizzle-orm"

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  emailVerified: boolean("email_verified").default(false),
  bannedAt: timestamp("banned_at"),
})

export const sessionsTable = pgTable("sessions", {
  id: varchar({ length: 255 }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
})

export const oneTimeCodesTable = pgTable(
  "one_time_codes",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .references(() => usersTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    code: varchar({ length: 16 }).notNull(),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
    verificationAttempts: integer("verification_attempts").default(0).notNull(),
  },
  (t) => [index().on(t.generatedAt)]
)

export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  used: boolean().default(false),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  hashedToken: varchar("hashed_token", { length: 512 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type User = InferSelectModel<typeof usersTable>
export type Session = InferSelectModel<typeof sessionsTable>
