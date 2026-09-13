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
  constructor(private repository: TasksRepository) {}

  getAllByBoardId = async (params: TaskGetAllByBoardIdInput) => {
    const rows = await this.repository.getAllByBoardId(params);
    return rows.map(withLabels);
  };

  getAllByColumnId = async (params: TaskGetAllByColumnIdInput) => {
    const rows = await this.repository.getAllByColumnId(params);
    return rows.map(withLabels);
  };

  getById = async (params: TaskGetByIdInput) => {
    const task = await this.repository.getById(params);
    return task ? withLabels(task) : undefined;
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
