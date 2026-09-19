import { HTTP_STATUS } from "../constants/http.constants.js";
import { ERROR_CODES } from "./error-codes.js";

type AppErrorInput = {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  cause?: unknown;
};

type HttpErrorInput = {
  message: string;
  code?: string;
  details?: unknown;
  cause?: unknown;
};

export class AppError extends Error {
  readonly statusCode;
  readonly code;
  readonly details;

  constructor({ statusCode, code, message, details, cause }: AppErrorInput) {
    super(message, { cause });
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  toResponse() {
    return { code: this.code, message: this.message, details: this.details };
  }
}

export class BadRequestError extends AppError {
  constructor({ code = ERROR_CODES.badRequest, ...rest }: HttpErrorInput) {
    super({ statusCode: HTTP_STATUS.badRequest, code, ...rest });
  }
}

export class UnauthorizedError extends AppError {
  constructor({ code = ERROR_CODES.unauthorized, ...rest }: HttpErrorInput) {
    super({ statusCode: HTTP_STATUS.unauthorized, code, ...rest });
  }
}

export class ForbiddenError extends AppError {
  constructor({ code = ERROR_CODES.forbidden, ...rest }: HttpErrorInput) {
    super({ statusCode: HTTP_STATUS.forbidden, code, ...rest });
  }
}

export class NotFoundError extends AppError {
  constructor({ code = ERROR_CODES.notFound, ...rest }: HttpErrorInput) {
    super({ statusCode: HTTP_STATUS.notFound, code, ...rest });
  }
}

export class ConflictError extends AppError {
  constructor({ code = ERROR_CODES.conflict, ...rest }: HttpErrorInput) {
    super({ statusCode: HTTP_STATUS.conflict, code, ...rest });
  }
}

export class ValidationError extends AppError {
  constructor({ code = ERROR_CODES.validation, ...rest }: HttpErrorInput) {
    super({ statusCode: HTTP_STATUS.unprocessableEntity, code, ...rest });
  }
}

export class InternalError extends AppError {
  constructor({ cause }: { cause: unknown }) {
    super({
      statusCode: HTTP_STATUS.internalServerError,
      code: ERROR_CODES.internal,
      message: "Internal server error",
      cause,
    });
  }
}
