import type { TasksRepository } from "./tasks.repository.js";
import type {
  TaskAttachLabelInput,
  TaskCreateInput,
  TaskDeleteInput,
  TaskDetachLabelInput,
  TaskGetAllByBoardIdInput,
  TaskGetAllByColumnIdInput,
  TaskUpdateInput,
} from "./tasks.schema.js";

export class TasksService {
  constructor(private repository: TasksRepository) {}

  getAllByBoardId = (params: TaskGetAllByBoardIdInput) => {
    return this.repository.getAllByBoardId(params);
  };

  getAllByColumnId = (params: TaskGetAllByColumnIdInput) => {
    return this.repository.getAllByColumnId(params);
  };

  create = async ({ userId, ...body }: TaskCreateInput) => {
    const [board] = await this.repository.findOwnedBoard({
      boardId: body.boardId,
      userId,
    });

    if (!board) {
      console.log("create task: board not owned", { userId, ...body });
      return [];
    }

    return this.repository.create(body);
  };

  update = async ({ userId, ...params }: TaskUpdateInput) => {
    if (params.boardColumnId !== undefined) {
      const [column] = await this.repository.findOwnedColumn({
        columnId: params.boardColumnId,
        userId,
      });

      if (!column) {
        console.log("update task: column not owned", { userId, ...params });
        return [];
      }
    }

    const rows = await this.repository.update({ userId, ...params });
    console.log("updated task:", rows);
    return rows;
  };

  delete = async (params: TaskDeleteInput) => {
    const rows = await this.repository.delete(params);
    console.log("deleted task:", rows);
    return rows;
  };

  attachLabel = async ({ userId, ...params }: TaskAttachLabelInput) => {
    const [task] = await this.repository.findOwnedTask({
      taskId: params.taskId,
      userId,
    });

    if (!task) {
      console.log("attach label: task not owned", { userId, ...params });
      return;
    }

    return this.repository.attachLabel(params);
  };

  detachLabel = async (params: TaskDetachLabelInput) => {
    const rows = await this.repository.detachLabel(params);
    console.log("detached label:", rows);
    return rows;
  };
}
