import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import healthRoutes from "./health.routes.js";

const healthModule: FastifyPluginAsyncTypebox = async (fastify) => {
  await fastify.register(healthRoutes, { prefix: "/health" });
};

export default healthModule;
