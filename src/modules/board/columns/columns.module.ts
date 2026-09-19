import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { DOCS_TAGS } from "@/core/constants/docs.constants.js";
import { documentRoutes } from "@/core/docs/document-routes.js";
import { BoardAccess } from "../boards/board-access.js";
import { BoardsRepository } from "../boards/boards.repository.js";
import { ColumnsController } from "./columns.controller.js";
import { ColumnsRepository } from "./columns.repository.js";
import columnsRoutes from "./columns.routes.js";
import { ColumnsService } from "./columns.service.js";

const columnsModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new ColumnsRepository(fastify.db);
  const boardAccess = new BoardAccess(new BoardsRepository(fastify.db));
  const service = new ColumnsService(repository, boardAccess);
  const controller = new ColumnsController(service);

  fastify.addHook("onRequest", fastify.authenticate);
  documentRoutes({ fastify, tag: DOCS_TAGS.columns, secured: true });

  fastify.decorate("columnsController", controller);
  await fastify.register(columnsRoutes, { prefix: "/columns" });
};

export default columnsModule;
