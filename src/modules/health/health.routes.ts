import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { HealthController } from "./health.controller.js";

const healthRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const controller = new HealthController();

  fastify.get("/", {
    schema: {
      summary: "Liveness probe",
      response: {
        [HTTP_STATUS.ok]: Type.Object({ status: Type.String() }),
      },
    },
    handler: controller.checkHealth,
  });
};

export default healthRoutes;
