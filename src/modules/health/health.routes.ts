import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { HealthResponseSchema } from "./health.schema.js";

const healthRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { healthController } = fastify;

  fastify.get("/", {
    schema: {
      summary: "Readiness probe, verifies the database connection",
      response: {
        [HTTP_STATUS.ok]: HealthResponseSchema,
        [HTTP_STATUS.serviceUnavailable]: HealthResponseSchema,
      },
    },
    handler: healthController.check,
  });
};

export default healthRoutes;
