import { isForeignKeyViolation } from "@/core/db/errors.js";
import type { BoardAccess } from "../boards/board-access.js";
import { ColumnNotFoundError } from "../columns/columns.errors.js";
import { LabelNotFoundError } from "../labels/labels.errors.js";
import { TASK_LABELS_CONSTRAINTS } from "../labels/labels.table.js";
import { TaskNotFoundError } from "./tasks.errors.js";
import type { TasksRepository } from "./tasks.repository.js";
import type {
  TaskAttachLabelInput,
  TaskCreateInput,
  TaskDeleteInput,
  TaskDetachLabelInput,
  TaskGetAllByBoardIdInput,
  TaskGetAllByColumnIdInput,
  TaskGetByIdInput,
  TaskUpdateInput,
} from "./tasks.schema.js";

type TaskWithJoinRows = {
  taskLabels: { label: { id: number; name: string } }[];
};

const withLabels = <T extends TaskWithJoinRows>({
  taskLabels,
  ...task
}: T) => ({
  ...task,
  labels: taskLabels.map(({ label }) => label),
});

export class TasksService {
  constructor(
    private repository: TasksRepository,
    private boardAccess: BoardAccess,
  ) {}

  private getOwnedTask = async ({
    taskId,
    userId,
  }: {
    taskId: number;
    userId: number;
  }) => {
    const [task] = await this.repository.findOwnedTask({ taskId, userId });

    if (!task) {
      throw new TaskNotFoundError({ taskId });
    }

    return task;
  };

  private getOwnedColumn = async ({
    columnId,
    userId,
  }: {
    columnId: number;
    userId: number;
  }) => {
    const [column] = await this.repository.findOwnedColumn({
      columnId,
      userId,
    });

    if (!column) {
      throw new ColumnNotFoundError({ columnId });
    }

    return column;
  };

  private assertColumnOnBoard = async ({
    columnId,
    boardId,
  }: {
    columnId: number;
    boardId: number;
  }) => {
    const [column] = await this.repository.findColumnOnBoard({
      columnId,
      boardId,
    });

    if (!column) {
      throw new ColumnNotFoundError({ columnId });
    }
  };

  private assertLabelOnBoard = async ({
    labelId,
    boardId,
  }: {
    labelId: number;
    boardId: number;
  }) => {
    const [label] = await this.repository.findLabelOnBoard({
      labelId,
      boardId,
    });

    if (!label) {
      throw new LabelNotFoundError({ labelId });
    }
  };

  getAllByBoardId = async (params: TaskGetAllByBoardIdInput) => {
    await this.boardAccess.assertOwned(params);

    const rows = await this.repository.getAllByBoardId(params);
    return rows.map(withLabels);
  };

  getAllByColumnId = async (params: TaskGetAllByColumnIdInput) => {
    await this.getOwnedColumn(params);

    const rows = await this.repository.getAllByColumnId(params);
    return rows.map(withLabels);
  };

  getById = async (params: TaskGetByIdInput) => {
    const task = await this.repository.getById(params);

    if (!task) {
      throw new TaskNotFoundError({ taskId: params.id });
    }

    return withLabels(task);
  };

  create = async ({ userId, ...body }: TaskCreateInput) => {
    await this.boardAccess.assertOwned({ boardId: body.boardId, userId });

    if (body.boardColumnId !== undefined) {
      await this.assertColumnOnBoard({
        columnId: body.boardColumnId,
        boardId: body.boardId,
      });
    }

    const [task] = await this.repository.create(body);
    return task;
  };

  update = async ({ userId, ...params }: TaskUpdateInput) => {
    if (params.boardColumnId !== undefined) {
      const { boardId } = await this.getOwnedTask({
        taskId: params.id,
        userId,
      });
      await this.assertColumnOnBoard({
        columnId: params.boardColumnId,
        boardId,
      });
    }

    const [task] = await this.repository.update({ userId, ...params });

    if (!task) {
      throw new TaskNotFoundError({ taskId: params.id });
    }

    return task;
  };

  delete = async (params: TaskDeleteInput) => {
    const [task] = await this.repository.delete(params);

    if (!task) {
      throw new TaskNotFoundError({ taskId: params.id });
    }
  };

  attachLabel = async ({ userId, ...params }: TaskAttachLabelInput) => {
    const { boardId } = await this.getOwnedTask({
      taskId: params.taskId,
      userId,
    });
    await this.assertLabelOnBoard({ labelId: params.labelId, boardId });

    try {
      await this.repository.attachLabel(params);
    } catch (error) {
      throw isForeignKeyViolation({
        error,
        constraint: TASK_LABELS_CONSTRAINTS.labelFk,
      })
        ? new LabelNotFoundError({ labelId: params.labelId })
        : error;
    }
  };

  detachLabel = async ({ userId, ...params }: TaskDetachLabelInput) => {
    await this.getOwnedTask({ taskId: params.taskId, userId });
    await this.repository.detachLabel(params);
  };
}
