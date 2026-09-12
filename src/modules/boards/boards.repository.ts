import { eq } from "drizzle-orm";
import type { Database } from "../../core/db/types/index.js";
import type { BoardCreateBody, BoardIdParams } from "./boards.schema.js";
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

  delete({ id }: BoardIdParams) {
    return this.db
      .delete(boards)
      .where(eq(boards.id, id))
      .returning({ id: boards.id });
  }
}
