import { and, eq } from "drizzle-orm";
import type { Database } from "../../core/db/types/index.js";
import type {
  BoardCreateInput,
  BoardDeleteInput,
  BoardGetAllInput,
} from "./boards.schema.js";
import { boards } from "./boards.table.js";

export class BoardsRepository {
  constructor(private readonly db: Database) {}

  getAll({ userId }: BoardGetAllInput) {
    return this.db.select().from(boards).where(eq(boards.userId, userId));
  }

  create(data: BoardCreateInput) {
    return this.db
      .insert(boards)
      .values(data)
      .returning({ id: boards.id, title: boards.title });
  }

  delete({ id, userId }: BoardDeleteInput) {
    return this.db
      .delete(boards)
      .where(and(eq(boards.id, id), eq(boards.userId, userId)))
      .returning({ id: boards.id });
  }
}
