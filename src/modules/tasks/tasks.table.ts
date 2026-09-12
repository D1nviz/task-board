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

export const priorityEnum = pgEnum("priority", ["low", "medium", "hight"]);

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

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  ...buildTimestamps(),
});

export const taskLabels = pgTable("task_labels", {
  taskId: integer("task_id")
    .references(() => tasks.id, {
      onDelete: "cascade",
    })
    .notNull(),
  labelId: integer("label_id")
    .references(() => labels.id, {
      onDelete: "cascade",
    })
    .notNull(),
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

export const labelsRelations = relations(labels, ({ many }) => ({
  taskLabels: many(taskLabels),
}));

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));
