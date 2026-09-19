import { and, asc, eq, inArray } from "drizzle-orm";

import type { Database } from "@/core/db/types/index.js";
import type { Actor } from "@/core/types/actor.js";
import { boards } from "../boards/boards.table.js";
import { boardColumns } from "../columns/columns.table.js";
import { labels, taskLabels } from "../labels/labels.table.js";
import type {
  TaskAttachLabelInput,
  TaskCreateBody,
  TaskDeleteInput,
  TaskDetachLabelInput,
  TaskGetAllByBoardIdInput,
  TaskGetAllByColumnIdInput,
  TaskGetByIdInput,
  TaskUpdateInput,
} from "./tasks.schema.js";
import { tasks } from "./tasks.table.js";

const withRelations = {
  taskLabels: {
    columns: {},
    with: { label: { columns: { id: true, name: true } } },
  },
  boardColumn: { columns: { id: true, title: true, sortOrder: true } },
  board: { columns: { id: true } },
} as const;

export class TasksRepository {
  constructor(private readonly db: Database) {}

  private ownedBoardIds = ({ userId }: Actor) =>
    this.db
      .select({ id: boards.id })
      .from(boards)
      .where(eq(boards.userId, userId));

  findOwnedTask = ({ taskId, userId }: { taskId: number } & Actor) => {
    return this.db
      .select({ id: tasks.id, boardId: tasks.boardId })
      .from(tasks)
      .where(
        and(
          eq(tasks.id, taskId),
          inArray(tasks.boardId, this.ownedBoardIds({ userId })),
        ),
      );
  };

  findOwnedColumn = ({ columnId, userId }: { columnId: number } & Actor) => {
    return this.db
      .select({ id: boardColumns.id, boardId: boardColumns.boardId })
      .from(boardColumns)
      .where(
        and(
          eq(boardColumns.id, columnId),
          inArray(boardColumns.boardId, this.ownedBoardIds({ userId })),
        ),
      );
  };

  findColumnOnBoard = ({
    columnId,
    boardId,
  }: {
    columnId: number;
    boardId: number;
  }) => {
    return this.db
      .select({ id: boardColumns.id })
      .from(boardColumns)
      .where(
        and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, boardId)),
      );
  };

  findLabelOnBoard = ({
    labelId,
    boardId,
  }: {
    labelId: number;
    boardId: number;
  }) => {
    return this.db
      .select({ id: labels.id })
      .from(labels)
      .where(and(eq(labels.id, labelId), eq(labels.boardId, boardId)));
  };

  getAllByBoardId = ({ boardId }: TaskGetAllByBoardIdInput) => {
    return this.db.query.tasks.findMany({
      where: eq(tasks.boardId, boardId),
      with: withRelations,
      orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
    });
  };

  getAllByColumnId = ({ columnId }: TaskGetAllByColumnIdInput) => {
    return this.db.query.tasks.findMany({
      where: eq(tasks.boardColumnId, columnId),
      with: withRelations,
      orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
    });
  };

  getById = ({ id, userId }: TaskGetByIdInput) => {
    return this.db.query.tasks.findFirst({
      where: and(
        eq(tasks.id, id),
        inArray(tasks.boardId, this.ownedBoardIds({ userId })),
      ),
      with: withRelations,
    });
  };

  create = (body: TaskCreateBody) => {
    return this.db.insert(tasks).values(body).returning();
  };

  update = ({ id, userId, ...data }: TaskUpdateInput) => {
    return this.db
      .update(tasks)
      .set(data)
      .where(
        and(
          eq(tasks.id, id),
          inArray(tasks.boardId, this.ownedBoardIds({ userId })),
        ),
      )
      .returning();
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

  detachLabel = ({ taskId, labelId }: Omit<TaskDetachLabelInput, "userId">) => {
    return this.db
      .delete(taskLabels)
      .where(
        and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId)),
      );
  };
}
