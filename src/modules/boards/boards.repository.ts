import type { Database } from "../../core/db/types/index.js";
import type { BoardCreateBody } from "./boards.schema.js";
import { boards } from "./boards.table.js";

export class BoardsRepository {
  constructor(private readonly db: Database) {}

  getAll() {
    return this.db.select().from(boards);
  }
  create(data: BoardCreateBody) {
    return this.db
      .insert(boards)
      .values(data)
      .returning({ id: boards.id, title: boards.title });
  }
}
