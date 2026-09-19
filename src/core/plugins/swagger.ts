import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import fp from "fastify-plugin";
import { AUTH_TOKENS } from "../../modules/identity/auth/auth.constants.js";
import { API_PREFIX } from "../constants/api.constants.js";
import {
  DOCS_ROUTE_PREFIX,
  DOCS_TAGS,
  SECURITY_SCHEMES,
} from "../constants/docs.constants.js";

const description = [
  "Task board API.",
  "",
  "Authentication uses httpOnly cookies. Call `POST " +
    `${API_PREFIX}/auth/sign-in\` (or sign-up) from this page: the browser stores the ` +
    "access and refresh cookies and sends them with every following request, " +
    "so the Authorize dialog is not needed.",
  "",
  "Errors share one shape: `{ code, message, details? }`, where `code` is a " +
    "stable machine-readable identifier such as `BOARD_NOT_FOUND`.",
].join("\n");

const swaggerPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.1.0",
      info: { title: "Task board", version: "0.1.0", description },
      tags: [
        { name: DOCS_TAGS.health, description: "Liveness" },
        { name: DOCS_TAGS.auth, description: "Sign up, sign in, sessions" },
        { name: DOCS_TAGS.boards, description: "Boards owned by the user" },
        { name: DOCS_TAGS.columns, description: "Columns of a board" },
        { name: DOCS_TAGS.labels, description: "Labels of a board" },
        { name: DOCS_TAGS.tasks, description: "Tasks and their labels" },
        { name: DOCS_TAGS.notes, description: "Personal notes" },
      ],
      components: {
        securitySchemes: {
          [SECURITY_SCHEMES.cookieAuth]: {
            type: "apiKey",
            in: "cookie",
            name: AUTH_TOKENS.accessToken,
            description:
              "Short-lived JWT access token set by sign-in, sign-up and refresh.",
          },
        },
      },
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: DOCS_ROUTE_PREFIX,
    uiConfig: {
      withCredentials: true,
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });
};

export default fp(swaggerPlugin, { name: "swagger-plugin" });
