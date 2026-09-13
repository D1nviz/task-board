import type { BoardsRepository } from "./boards.repository.js";
import type {
  BoardCreateInput,
  BoardDeleteInput,
  BoardGetAllInput,
  BoardUpdateInput,
} from "./boards.schema.js";

export class BoardsService {
  constructor(private repository: BoardsRepository) {}

  getAll(params: BoardGetAllInput) {
    return this.repository.getAll(params);
  }

  create(data: BoardCreateInput) {
    return this.repository.create(data);
  }

  async update(params: BoardUpdateInput) {
    const rows = await this.repository.update(params);
    console.log("updated board:", rows);
    return rows;
  }

  async delete(params: BoardDeleteInput) {
    const rows = await this.repository.delete(params);
    console.log("deleted board:", rows);
    return rows;
  }
}
