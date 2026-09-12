import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { buildTimestamps } from "../../core/db/helpers/timestamp.js";
import { boardColumns, boards } from "../boards/boards.table.js";
import { taskLabels } from "../labels/labels.table.js";

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  boardId: integer("board_id")
    .references(() => boards.id, {
      onDelete: "cascade",
    })
    .notNull(),
  boardColumnsId: integer("board_columns_id").references(
    () => boardColumns.id,
    {
      onDelete: "set null",
    },
  ),
  priority: priorityEnum().default("medium"),
  ...buildTimestamps(),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  board: one(boards, {
    fields: [tasks.boardId],
    references: [boards.id],
  }),
  boardColumn: one(boardColumns, {
    fields: [tasks.boardColumnsId],
    references: [boardColumns.id],
  }),
  taskLabels: many(taskLabels),
}));
