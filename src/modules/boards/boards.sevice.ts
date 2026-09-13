import type { BoardsRepository } from "./boards.repository.js";
import type {
  BoardCreateData,
  BoardDeleteParams,
  BoardGetAllParams,
} from "./boards.schema.js";

export class BoardsService {
  constructor(private repository: BoardsRepository) {}

  getAll(params: BoardGetAllParams) {
    return this.repository.getAll(params);
  }

  create(data: BoardCreateData) {
    return this.repository.create(data);
  }

  async delete(params: BoardDeleteParams) {
    const rows = await this.repository.delete(params);
    console.log("deleted board:", rows);
    return rows;
  }
}
