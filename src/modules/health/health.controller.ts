import type { FastifyReply, FastifyRequest } from "fastify";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { HEALTH_STATUSES } from "./health.schema.js";
import type { HealthService } from "./health.service.js";

export class HealthController {
  constructor(private readonly service: HealthService) {}

  check = async (_req: FastifyRequest, reply: FastifyReply) => {
    const health = await this.service.check();
    const statusCode =
      health.status === HEALTH_STATUSES.ok
        ? HTTP_STATUS.ok
        : HTTP_STATUS.serviceUnavailable;

    return reply.code(statusCode).send(health);
  };
}
