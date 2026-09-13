import { and, eq } from "drizzle-orm";
import type { Database } from "../../core/db/types/index.js";
import type {
  BoardCreateData,
  BoardDeleteParams,
  BoardGetAllParams,
} from "./boards.schema.js";
import { boards } from "./boards.table.js";

export class BoardsRepository {
  constructor(private readonly db: Database) {}

  getAll({ userId }: BoardGetAllParams) {
    return this.db.select().from(boards).where(eq(boards.userId, userId));
  }

  create(data: BoardCreateData) {
    return this.db
      .insert(boards)
      .values(data)
      .returning({ id: boards.id, title: boards.title });
  }

  delete({ id, userId }: BoardDeleteParams) {
    return this.db
      .delete(boards)
      .where(and(eq(boards.id, id), eq(boards.userId, userId)))
      .returning({ id: boards.id });
  }
}
