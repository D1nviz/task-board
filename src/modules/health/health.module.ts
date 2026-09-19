import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { DOCS_TAGS } from "@/core/constants/docs.constants.js";
import { documentRoutes } from "@/core/docs/document-routes.js";
import healthRoutes from "./health.routes.js";

const healthModule: FastifyPluginAsyncTypebox = async (fastify) => {
  documentRoutes({ fastify, tag: DOCS_TAGS.health, secured: false });
  await fastify.register(healthRoutes, { prefix: "/health" });
};

export default healthModule;
