import type { FastifyPluginAsync } from "fastify";
import { HealthController } from "./health.controller.js";

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new HealthController();

  fastify.get("/", {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
          },
        },
      },
    },
    handler: controller.checkHealth,
  });
};

export default healthRoutes;
