import { NotFoundError } from "@/core/errors/index.js";

export const BOARDS_ERROR_CODES = {
  notFound: "BOARD_NOT_FOUND",
} as const;

export class BoardNotFoundError extends NotFoundError {
  constructor({ boardId }: { boardId: number }) {
    super({
      code: BOARDS_ERROR_CODES.notFound,
      message: "Board not found",
      details: { boardId },
    });
  }
}
