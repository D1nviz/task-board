import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  serial,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { buildTimestamps } from "@/core/db/helpers/timestamp.js";
import { boards } from "../boards/boards.table.js";
import { tasks } from "../tasks/tasks.table.js";

export const labels = pgTable(
  "labels",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    boardId: integer("board_id")
      .references(() => boards.id, {
        onDelete: "cascade",
      })
      .notNull(),
    ...buildTimestamps(),
  },
  (table) => [
    unique("labels_board_id_name_unique").on(table.boardId, table.name),
  ],
);

export const taskLabels = pgTable(
  "task_labels",
  {
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
  },
  (table) => [
    primaryKey({
      columns: [table.taskId, table.labelId],
    }),
  ],
);

export const labelsRelations = relations(labels, ({ one, many }) => ({
  board: one(boards, {
    fields: [labels.boardId],
    references: [boards.id],
  }),
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
