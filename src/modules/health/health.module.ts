import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { DOCS_TAGS } from "@/core/constants/docs.constants.js";
import { documentRoutes } from "@/core/docs/document-routes.js";
import { HealthController } from "./health.controller.js";
import healthRoutes from "./health.routes.js";
import { HealthService } from "./health.service.js";

const healthModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const service = new HealthService(fastify.db);
  const controller = new HealthController(service);

  documentRoutes({ fastify, tag: DOCS_TAGS.health, secured: false });
  fastify.decorate("healthController", controller);
  await fastify.register(healthRoutes, { prefix: "/health" });
};

export default healthModule;
