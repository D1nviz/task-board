import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { buildTimestamps } from "../../core/db/helpers/timestamp.js";
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

export const credentialsRelations = relations(credentials, ({ one }) => ({
  user: one(users, {
    fields: [credentials.userId],
    references: [users.id],
  }),
}));
