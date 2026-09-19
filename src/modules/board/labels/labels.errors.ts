import { ConflictError, NotFoundError } from "@/core/errors/index.js";

export const LABELS_ERROR_CODES = {
  notFound: "LABEL_NOT_FOUND",
  nameTaken: "LABEL_NAME_TAKEN",
} as const;

export class LabelNotFoundError extends NotFoundError {
  constructor({ labelId }: { labelId: number }) {
    super({
      code: LABELS_ERROR_CODES.notFound,
      message: "Label not found",
      details: { labelId },
    });
  }
}

export class LabelNameTakenError extends ConflictError {
  constructor({ name }: { name: string }) {
    super({
      code: LABELS_ERROR_CODES.nameTaken,
      message: "Label with this name already exists on the board",
      details: { name },
    });
  }
}
