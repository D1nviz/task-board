import type { FastifyInstance } from "fastify";
import { COOKIE_SECURITY } from "../constants/docs.constants.js";
import { HTTP_STATUS } from "../constants/http.constants.js";
import { ErrorResponseSchema } from "../errors/index.js";

export const documentRoutes = ({
  fastify,
  tag,
  secured,
}: {
  fastify: FastifyInstance;
  tag: string;
  secured: boolean;
}) => {
  fastify.addHook("onRoute", (route) => {
    const schema = route.schema ?? {};
    const hooks = [route.onRequest ?? []].flat();
    const isSecured =
      secured || hooks.some((hook) => hook === fastify.authenticate);
    const validatesInput = Boolean(
      schema.body || schema.params || schema.querystring,
    );
    const existingResponse =
      typeof schema.response === "object" && schema.response !== null
        ? schema.response
        : {};

    route.schema = {
      tags: [tag],
      ...(isSecured ? { security: COOKIE_SECURITY } : {}),
      ...schema,
      response: {
        ...(validatesInput
          ? { [HTTP_STATUS.badRequest]: ErrorResponseSchema }
          : {}),
        ...(isSecured
          ? { [HTTP_STATUS.unauthorized]: ErrorResponseSchema }
          : {}),
        ...existingResponse,
      },
    };
  });
};
