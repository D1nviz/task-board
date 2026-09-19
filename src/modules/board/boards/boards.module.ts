import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { DOCS_TAGS } from "@/core/constants/docs.constants.js";
import { documentRoutes } from "@/core/docs/document-routes.js";
import { BoardsController } from "./boards.controller.js";
import { BoardsRepository } from "./boards.repository.js";
import boardsRoutes from "./boards.routes.js";
import { BoardsService } from "./boards.sevice.js";

const boardsModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new BoardsRepository(fastify.db);
  const service = new BoardsService(repository);
  const controller = new BoardsController(service);

  fastify.addHook("onRequest", fastify.authenticate);
  documentRoutes({ fastify, tag: DOCS_TAGS.boards, secured: true });

  fastify.decorate("boardsController", controller);
  await fastify.register(boardsRoutes, { prefix: "/boards" });
};

export default boardsModule;
