import type { TasksRepository } from "./tasks.repository.js";
import type {
  TaskByBoardIdParams,
  TaskByColumnIdParams,
  TaskCreateBodyParams,
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
  delete = () => {};
  update = () => {};
}
