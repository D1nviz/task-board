import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { BoardsController } from "./boards.controller.js";
import { BoardsRepository } from "./boards.repository.js";
import boardsRoutes from "./boards.routes.js";
import { BoardsService } from "./boards.sevice.js";

const boardsModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new BoardsRepository(fastify.db);
  const service = new BoardsService(repository);
  const controller = new BoardsController(service);

  fastify.decorate("boardsController", controller);
  await fastify.register(boardsRoutes);
};

export default boardsModule;
