import { and, eq } from "drizzle-orm";

import type { Database } from "../../core/db/types/index.js";
import { taskLabels } from "../labels/labels.table.js";
import type {
  TaskByBoardIdParams,
  TaskByColumnIdParams,
  TaskCreateBodyParams,
  TaskIdParams,
  TaskLabelParams,
} from "./tasks.schema.js";
import { tasks } from "./tasks.table.js";

export class TasksRepository {
  constructor(private readonly db: Database) {}

  getAllByBoardId = ({ boardId }: TaskByBoardIdParams) => {
    return this.db.query.tasks.findMany({
      where: eq(tasks.boardId, boardId),
      with: {
        taskLabels: true,
        boardColumn: { columns: { id: true, boardId: true } },
        board: { columns: { id: true } },
      },
    });
  };

  getAllByColumnId = ({ columnId }: TaskByColumnIdParams) => {
    return this.db.query.tasks.findMany({
      where: eq(tasks.boardColumnsId, columnId),
      with: {
        taskLabels: true,
        boardColumn: true,
        board: true,
      },
    });
  };

  create = (body: TaskCreateBodyParams) => {
    return this.db.insert(tasks).values(body).returning();
  };

  delete = ({ id }: TaskIdParams) => {
    return this.db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });
  };

  attachLabel = ({ taskId, labelId }: TaskLabelParams) => {
    return this.db
      .insert(taskLabels)
      .values({ taskId, labelId })
      .onConflictDoNothing();
  };

  detachLabel = ({ taskId, labelId }: TaskLabelParams) => {
    return this.db
      .delete(taskLabels)
      .where(
        and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId)),
      )
      .returning({ taskId: taskLabels.taskId });
  };
}
