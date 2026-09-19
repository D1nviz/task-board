import { and, asc, eq, inArray, max } from "drizzle-orm";
import type { Database } from "@/core/db/types/index.js";
import type { Actor } from "@/core/types/actor.js";
import { boards } from "../boards/boards.table.js";
import type {
  ColumnCreateBody,
  ColumnDeleteInput,
  ColumnGetAllByBoardIdInput,
  ColumnGetByIdInput,
  ColumnUpdateInput,
} from "./columns.schema.js";
import { boardColumns } from "./columns.table.js";

const columns = {
  id: boardColumns.id,
  title: boardColumns.title,
  boardId: boardColumns.boardId,
  sortOrder: boardColumns.sortOrder,
};

export class ColumnsRepository {
  constructor(private readonly db: Database) {}

  private ownedBoardIds = ({ userId }: Actor) =>
    this.db
      .select({ id: boards.id })
      .from(boards)
      .where(eq(boards.userId, userId));

  getAllByBoardId = ({ boardId }: ColumnGetAllByBoardIdInput) => {
    return this.db
      .select(columns)
      .from(boardColumns)
      .where(eq(boardColumns.boardId, boardId))
      .orderBy(asc(boardColumns.sortOrder), asc(boardColumns.id));
  };

  getById = ({ id, userId }: ColumnGetByIdInput) => {
    return this.db
      .select(columns)
      .from(boardColumns)
      .where(
        and(
          eq(boardColumns.id, id),
          inArray(boardColumns.boardId, this.ownedBoardIds({ userId })),
        ),
      );
  };

  private nextSortOrder = async (boardId: number) => {
    const [row] = await this.db
      .select({ value: max(boardColumns.sortOrder) })
      .from(boardColumns)
      .where(eq(boardColumns.boardId, boardId));

    return (row?.value ?? -1) + 1;
  };

  create = async ({ sortOrder, ...data }: ColumnCreateBody) => {
    return this.db
      .insert(boardColumns)
      .values({
        ...data,
        sortOrder: sortOrder ?? (await this.nextSortOrder(data.boardId)),
      })
      .returning(columns);
  };

  update = ({ id, userId, ...data }: ColumnUpdateInput) => {
    return this.db
      .update(boardColumns)
      .set(data)
      .where(
        and(
          eq(boardColumns.id, id),
          inArray(boardColumns.boardId, this.ownedBoardIds({ userId })),
        ),
      )
      .returning(columns);
  };

  delete = ({ id, userId }: ColumnDeleteInput) => {
    return this.db
      .delete(boardColumns)
      .where(
        and(
          eq(boardColumns.id, id),
          inArray(boardColumns.boardId, this.ownedBoardIds({ userId })),
        ),
      )
      .returning({ id: boardColumns.id });
  };
}
