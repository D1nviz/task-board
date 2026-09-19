import { NotFoundError } from "@/core/errors/index.js";

export const TASKS_ERROR_CODES = {
  notFound: "TASK_NOT_FOUND",
} as const;

export class TaskNotFoundError extends NotFoundError {
  constructor({ taskId }: { taskId: number }) {
    super({
      code: TASKS_ERROR_CODES.notFound,
      message: "Task not found",
      details: { taskId },
    });
  }
}
