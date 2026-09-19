import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { FastifyError } from "fastify";
import fp from "fastify-plugin";
import { HTTP_STATUS } from "../constants/http.constants.js";
import { LOG_LEVELS } from "../constants/log.constants.js";
import {
  AppError,
  BadRequestError,
  ERROR_CODES,
  InternalError,
  NotFoundError,
} from "../errors/index.js";

const isFastifyError = (error: unknown): error is FastifyError =>
  error instanceof Error && "code" in error && "statusCode" in error;

const normalise = (error: unknown) => {
  if (error instanceof AppError) {
    return error;
  }

  if (isFastifyError(error)) {
    if (error.validation) {
      return new BadRequestError({
        code: ERROR_CODES.validation,
        message: "Request validation failed",
        details: error.validation,
      });
    }

    if (
      error.statusCode !== undefined &&
      error.statusCode < HTTP_STATUS.internalServerError
    ) {
      return new AppError({
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    }
  }

  return new InternalError({ cause: error });
};

const errorHandlerPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    const appError = normalise(error);
    const level =
      appError.logLevel ??
      (appError.statusCode >= HTTP_STATUS.internalServerError
        ? LOG_LEVELS.error
        : LOG_LEVELS.info);

    request.log[level]({ err: error }, appError.code);
    return reply.code(appError.statusCode).send(appError.toResponse());
  });

  fastify.setNotFoundHandler((request, reply) => {
    const error = new NotFoundError({
      code: ERROR_CODES.routeNotFound,
      message: `Route ${request.method} ${request.url} not found`,
    });

    return reply.code(error.statusCode).send(error.toResponse());
  });
};

export default fp(errorHandlerPlugin, { name: "error-handler-plugin" });
