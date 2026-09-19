import type { FastifyInstance } from "fastify";
import { AUTH_REFRESH_TOKEN_CLEANUP_INTERVAL_MS } from "./auth.constants.js";
import type { AuthService } from "./auth.service.js";

export const registerAuthJobs = ({
  fastify,
  service,
}: {
  fastify: FastifyInstance;
  service: AuthService;
}) => {
  const purgeExpiredSessions = async () => {
    try {
      const count = await service.purgeExpiredSessions();

      if (count > 0) {
        fastify.log.info({ count }, "expired refresh tokens purged");
      }
    } catch (error) {
      fastify.log.error({ err: error }, "expired refresh tokens purge failed");
    }
  };

  let purgeTimer: NodeJS.Timeout | undefined;

  fastify.addHook("onReady", async () => {
    await purgeExpiredSessions();
    purgeTimer = setInterval(
      purgeExpiredSessions,
      AUTH_REFRESH_TOKEN_CLEANUP_INTERVAL_MS,
    ).unref();
  });

  fastify.addHook("onClose", async () => {
    clearInterval(purgeTimer);
  });
};
