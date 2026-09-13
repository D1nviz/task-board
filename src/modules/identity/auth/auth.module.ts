import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { UsersRepository } from "../users/users.repository.js";
import { AuthController } from "./auth.controller.js";
import { AuthRepository } from "./auth.repository.js";
import authRoutes from "./auth.routes.js";
import { AuthService } from "./auth.service.js";

const authModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new AuthRepository(fastify.db);
  const usersRepository = new UsersRepository(fastify.db);
  const service = new AuthService(repository, usersRepository, fastify.db);
  const controller = new AuthController(service, fastify.jwt, fastify.config);

  fastify.decorate("authController", controller);
  await fastify.register(authRoutes, { prefix: "/auth" });
};

export default authModule;
