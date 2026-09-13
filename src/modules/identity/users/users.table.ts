import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { buildTimestamps } from "@/core/db/helpers/timestamp.js";
import { credentials } from "../auth/auth.table.js";

export const rolesEnum = pgEnum("role", ["admin", "user"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 256 }).unique().notNull(),
  firstName: varchar("first_name", { length: 256 }).notNull(),
  lastName: varchar("last_name", { length: 256 }).notNull(),
  role: rolesEnum("role").default("user").notNull(),
  ...buildTimestamps(),
});

export const usersRelations = relations(users, ({ one }) => ({
  credentials: one(credentials),
}));
