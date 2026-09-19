import { relations } from "drizzle-orm";
import {
  foreignKey,
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

export const LABELS_CONSTRAINTS = {
  boardIdNameUnique: "labels_board_id_name_unique",
} as const;

export const TASK_LABELS_CONSTRAINTS = {
  labelFk: "task_labels_label_id_labels_id_fk",
} as const;

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
    unique(LABELS_CONSTRAINTS.boardIdNameUnique).on(table.boardId, table.name),
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
    labelId: integer("label_id").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.taskId, table.labelId],
    }),
    foreignKey({
      name: TASK_LABELS_CONSTRAINTS.labelFk,
      columns: [table.labelId],
      foreignColumns: [labels.id],
    }).onDelete("cascade"),
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
