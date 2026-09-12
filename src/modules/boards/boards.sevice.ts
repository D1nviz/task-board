import type { BoardsRepository } from "./boards.repository.js";
import type { BoardCreateBody, BoardIdParams } from "./boards.schema.js";

export class BoardsService {
  constructor(private repository: BoardsRepository) {}

  getAll() {
    return this.repository.getAll();
  }

  create(data: BoardCreateBody) {
    return this.repository.create(data);
  }

  async delete(params: BoardIdParams) {
    const rows = await this.repository.delete(params);
    console.log("deleted board:", rows);
    return rows;
  }
}
