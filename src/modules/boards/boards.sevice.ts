import type { BoardsRepository } from "./boards.repository.js";
import type { BoardCreateBody } from "./boards.schema.js";

export class BoardsService {
  constructor(private repository: BoardsRepository) {}

  getAll() {
    return this.repository.getAll();
  }

  create(data: BoardCreateBody) {
    return this.repository.create(data);
  }
}
