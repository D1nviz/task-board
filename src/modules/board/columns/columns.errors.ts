import { NotFoundError } from "@/core/errors/index.js";

export const COLUMNS_ERROR_CODES = {
  notFound: "COLUMN_NOT_FOUND",
} as const;

export class ColumnNotFoundError extends NotFoundError {
  constructor({ columnId }: { columnId: number }) {
    super({
      code: COLUMNS_ERROR_CODES.notFound,
      message: "Column not found",
      details: { columnId },
    });
  }
}
