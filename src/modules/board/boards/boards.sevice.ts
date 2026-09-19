import { BoardNotFoundError } from "./boards.errors.js";
import type { BoardsRepository } from "./boards.repository.js";
import type {
  BoardCreateInput,
  BoardDeleteInput,
  BoardGetAllInput,
  BoardGetByIdInput,
  BoardUpdateInput,
} from "./boards.schema.js";

export class BoardsService {
  constructor(private repository: BoardsRepository) {}

  getAll = (params: BoardGetAllInput) => {
    return this.repository.getAll(params);
  };

  getById = async (params: BoardGetByIdInput) => {
    const [board] = await this.repository.getById(params);

    if (!board) {
      throw new BoardNotFoundError({ boardId: params.id });
    }

    return board;
  };

  create = async (data: BoardCreateInput) => {
    const [board] = await this.repository.create(data);
    return board;
  };

  update = async (params: BoardUpdateInput) => {
    const [board] = await this.repository.update(params);

    if (!board) {
      throw new BoardNotFoundError({ boardId: params.id });
    }

    return board;
  };

  delete = async (params: BoardDeleteInput) => {
    const [board] = await this.repository.delete(params);

    if (!board) {
      throw new BoardNotFoundError({ boardId: params.id });
    }
  };
}
