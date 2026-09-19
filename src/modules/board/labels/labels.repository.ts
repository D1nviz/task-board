import { and, eq, inArray } from "drizzle-orm";
import type { Database } from "@/core/db/types/index.js";
import type { Actor } from "@/core/types/actor.js";
import { boards } from "../boards/boards.table.js";
import type {
  LabelCreateBody,
  LabelDeleteInput,
  LabelGetAllByBoardIdInput,
  LabelGetByIdInput,
  LabelUpdateInput,
} from "./labels.schema.js";
import { labels } from "./labels.table.js";

const columns = {
  id: labels.id,
  name: labels.name,
  boardId: labels.boardId,
};

export class LabelsRepository {
  constructor(private readonly db: Database) {}

  private ownedBoardIds = ({ userId }: Actor) =>
    this.db
      .select({ id: boards.id })
      .from(boards)
      .where(eq(boards.userId, userId));

  getAllByBoardId = ({ boardId }: LabelGetAllByBoardIdInput) => {
    return this.db
      .select(columns)
      .from(labels)
      .where(eq(labels.boardId, boardId));
  };

  getById = ({ id, userId }: LabelGetByIdInput) => {
    return this.db
      .select(columns)
      .from(labels)
      .where(
        and(
          eq(labels.id, id),
          inArray(labels.boardId, this.ownedBoardIds({ userId })),
        ),
      );
  };

  create = (data: LabelCreateBody) => {
    return this.db.insert(labels).values(data).returning(columns);
  };

  update = ({ id, userId, ...data }: LabelUpdateInput) => {
    return this.db
      .update(labels)
      .set(data)
      .where(
        and(
          eq(labels.id, id),
          inArray(labels.boardId, this.ownedBoardIds({ userId })),
        ),
      )
      .returning(columns);
  };

  delete = ({ id, userId }: LabelDeleteInput) => {
    return this.db
      .delete(labels)
      .where(
        and(
          eq(labels.id, id),
          inArray(labels.boardId, this.ownedBoardIds({ userId })),
        ),
      )
      .returning({ id: labels.id });
  };
}
