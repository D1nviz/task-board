import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { buildTimestamps } from "../../core/db/helpers/timestamp.js";
import { tasks } from "../tasks/tasks.table.js";

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  ...buildTimestamps(),
});

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
