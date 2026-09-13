import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { buildTimestamps } from "@/core/db/helpers/timestamp.js";
import { users } from "../../identity/users/users.table.js";
import { boardColumns } from "../columns/columns.table.js";
import { tasks } from "../tasks/tasks.table.js";

export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  userId: integer("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  ...buildTimestamps(),
});

export const boardsRelations = relations(boards, ({ one, many }) => ({
  boardColumns: many(boardColumns),
  tasks: many(tasks),
  user: one(users, {
    fields: [boards.userId],
    references: [users.id],
  }),
}));
