import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { buildTimestamps } from "@/core/db/helpers/timestamp.js";
import { users } from "../users/users.table.js";

export const credentials = pgTable("credentials", {
  userId: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .primaryKey(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  ...buildTimestamps(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  familyId: uuid("family_id").notNull(),
  userId: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...buildTimestamps(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const credentialsRelations = relations(credentials, ({ one }) => ({
  user: one(users, {
    fields: [credentials.userId],
    references: [users.id],
  }),
}));
