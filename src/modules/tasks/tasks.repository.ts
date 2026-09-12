import { eq } from "drizzle-orm";

import type { Database } from "../../core/db/types/index.js";
import type {
  TaskByBoardIdParams,
  TaskByColumnIdParams,
  TaskCreateBodyParams,
} from "./tasks.schema.js";
import { tasks } from "./tasks.table.js";

export class TasksRepository {
  constructor(private readonly db: Database) {}

  getAllByBoardId = ({ boardId }: TaskByBoardIdParams) => {
    return this.db.query.tasks.findMany({
      where: eq(tasks.boardId, boardId),
      with: {
        taskLabels: true,
        boardColumn: true,
        board: true,
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
  delete = () => {};
  update = () => {};
}
