import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, unique, varchar } from "drizzle-orm/pg-core";
import { buildTimestamps } from "@/core/db/helpers/timestamp.js";
import { credentials } from "../auth/auth.table.js";

export const rolesEnum = pgEnum("role", ["admin", "user"]);

export const USERS_CONSTRAINTS = {
  emailUnique: "users_email_unique",
} as const;

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 256 }).notNull(),
    firstName: varchar("first_name", { length: 256 }).notNull(),
    lastName: varchar("last_name", { length: 256 }).notNull(),
    role: rolesEnum("role").default("user").notNull(),
    ...buildTimestamps(),
  },
  (table) => [unique(USERS_CONSTRAINTS.emailUnique).on(table.email)],
);

export const usersRelations = relations(users, ({ one }) => ({
  credentials: one(credentials),
}));
