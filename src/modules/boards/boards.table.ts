import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { buildTimestamps } from "../../core/db/helpers/timestamp.js";
import { tasks } from "../tasks/tasks.table.js";
import { users } from "../users/users.table.js";

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

export const boardColumns = pgTable("board_columns", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  boardId: integer("board_id")
    .references(() => boards.id, {
      onDelete: "cascade",
    })
    .notNull(),
  sortOrder: integer("sort_order").notNull(),
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

export const boardColumnsRelations = relations(
  boardColumns,
  ({ one, many }) => ({
    board: one(boards, {
      fields: [boardColumns.boardId],
      references: [boards.id],
    }),
    tasks: many(tasks),
  }),
);
