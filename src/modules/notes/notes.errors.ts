import { NotFoundError } from "@/core/errors/index.js";

export const NOTES_ERROR_CODES = {
  notFound: "NOTE_NOT_FOUND",
} as const;

export class NoteNotFoundError extends NotFoundError {
  constructor({ noteId }: { noteId: number }) {
    super({
      code: NOTES_ERROR_CODES.notFound,
      message: "Note not found",
      details: { noteId },
    });
  }
}
