import { and, eq, inArray } from "drizzle-orm";

import type { Database } from "../../core/db/types/index.js";
import type { Actor } from "../../core/types/actor.js";
import { boards } from "../boards/boards.table.js";
import { taskLabels } from "../labels/labels.table.js";
import type {
  TaskAttachLabelInput,
  TaskCreateBody,
  TaskDeleteInput,
  TaskDetachLabelInput,
  TaskGetAllByBoardIdInput,
  TaskGetAllByColumnIdInput,
} from "./tasks.schema.js";
import { tasks } from "./tasks.table.js";

export class TasksRepository {
  constructor(private readonly db: Database) {}

  private ownedBoardIds = ({ userId }: Actor) =>
    this.db
      .select({ id: boards.id })
      .from(boards)
      .where(eq(boards.userId, userId));

  private ownedTaskIds = ({ userId }: Actor) =>
    this.db
      .select({ id: tasks.id })
      .from(tasks)
      .where(inArray(tasks.boardId, this.ownedBoardIds({ userId })));

  findOwnedBoard = ({ boardId, userId }: { boardId: number } & Actor) => {
    return this.db
      .select({ id: boards.id })
      .from(boards)
      .where(and(eq(boards.id, boardId), eq(boards.userId, userId)));
  };

  findOwnedTask = ({ taskId, userId }: { taskId: number } & Actor) => {
    return this.db
      .select({ id: tasks.id })
      .from(tasks)
      .where(
        and(
          eq(tasks.id, taskId),
          inArray(tasks.boardId, this.ownedBoardIds({ userId })),
        ),
      );
  };

  getAllByBoardId = ({ boardId, userId }: TaskGetAllByBoardIdInput) => {
    return this.db.query.tasks.findMany({
      where: and(
        eq(tasks.boardId, boardId),
        inArray(tasks.boardId, this.ownedBoardIds({ userId })),
      ),
      with: {
        taskLabels: true,
        boardColumn: { columns: { id: true, boardId: true } },
        board: { columns: { id: true } },
      },
    });
  };

  getAllByColumnId = ({ columnId, userId }: TaskGetAllByColumnIdInput) => {
    return this.db.query.tasks.findMany({
      where: and(
        eq(tasks.boardColumnId, columnId),
        inArray(tasks.boardId, this.ownedBoardIds({ userId })),
      ),
      with: {
        taskLabels: true,
        boardColumn: true,
        board: true,
      },
    });
  };

  create = (body: TaskCreateBody) => {
    return this.db.insert(tasks).values(body).returning();
  };

  delete = ({ id, userId }: TaskDeleteInput) => {
    return this.db
      .delete(tasks)
      .where(
        and(
          eq(tasks.id, id),
          inArray(tasks.boardId, this.ownedBoardIds({ userId })),
        ),
      )
      .returning({ id: tasks.id });
  };

  attachLabel = ({ taskId, labelId }: Omit<TaskAttachLabelInput, "userId">) => {
    return this.db
      .insert(taskLabels)
      .values({ taskId, labelId })
      .onConflictDoNothing();
  };

  detachLabel = ({ taskId, labelId, userId }: TaskDetachLabelInput) => {
    return this.db
      .delete(taskLabels)
      .where(
        and(
          eq(taskLabels.taskId, taskId),
          eq(taskLabels.labelId, labelId),
          inArray(taskLabels.taskId, this.ownedTaskIds({ userId })),
        ),
      )
      .returning({ taskId: taskLabels.taskId });
  };
}
