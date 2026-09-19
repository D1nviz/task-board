import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { DOCS_TAGS } from "@/core/constants/docs.constants.js";
import { documentRoutes } from "@/core/docs/document-routes.js";
import { UsersRepository } from "../users/users.repository.js";
import { AUTH_REFRESH_TOKEN_CLEANUP_INTERVAL_MS } from "./auth.constants.js";
import { AuthController } from "./auth.controller.js";
import { AuthRepository } from "./auth.repository.js";
import authRoutes from "./auth.routes.js";
import { AuthService } from "./auth.service.js";

const authModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new AuthRepository(fastify.db);
  const usersRepository = new UsersRepository(fastify.db);
  const service = new AuthService(repository, usersRepository, fastify.db);
  const controller = new AuthController(service, fastify.jwt, fastify.config);

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

  documentRoutes({ fastify, tag: DOCS_TAGS.auth, secured: false });
  fastify.decorate("authController", controller);
  await fastify.register(authRoutes, { prefix: "/auth" });
};

export default authModule;
