import type { TasksRepository } from "./tasks.repository.js";
import type {
  TaskByBoardIdParams,
  TaskByColumnIdParams,
  TaskCreateBodyParams,
  TaskIdParams,
  TaskLabelParams,
} from "./tasks.schema.js";

export class TasksService {
  constructor(private repository: TasksRepository) {}

  getAllByBoardId = ({ boardId }: TaskByBoardIdParams) => {
    return this.repository.getAllByBoardId({ boardId });
  };

  getAllByColumnId = ({ columnId }: TaskByColumnIdParams) => {
    return this.repository.getAllByColumnId({ columnId });
  };

  create = (body: TaskCreateBodyParams) => {
    return this.repository.create(body);
  };

  delete = async (params: TaskIdParams) => {
    const rows = await this.repository.delete(params);
    console.log("deleted task:", rows);
    return rows;
  };

  attachLabel = (params: TaskLabelParams) => {
    return this.repository.attachLabel(params);
  };

  detachLabel = async (params: TaskLabelParams) => {
    const rows = await this.repository.detachLabel(params);
    console.log("detached label:", rows);
    return rows;
  };
}
