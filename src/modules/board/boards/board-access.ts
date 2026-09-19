import { BoardNotFoundError } from "./boards.errors.js";
import type { BoardsRepository } from "./boards.repository.js";

export class BoardAccess {
  constructor(private readonly repository: BoardsRepository) {}

  assertOwned = async ({
    boardId,
    userId,
  }: {
    boardId: number;
    userId: number;
  }) => {
    const [board] = await this.repository.getById({ id: boardId, userId });

    if (!board) {
      throw new BoardNotFoundError({ boardId });
    }
  };
}
