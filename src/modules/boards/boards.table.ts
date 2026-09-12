import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { buildTimestamps } from "../../core/db/helpers/timestamp.js";
import { tasks } from "../tasks/tasks.table.js";

export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull().unique(),
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
  order: integer().notNull(),
  ...buildTimestamps(),
});

export const boardRelations = relations(boards, ({ many }) => ({
  boardColumns: many(boardColumns),
  tasks: many(tasks),
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
