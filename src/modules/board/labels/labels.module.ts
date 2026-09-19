import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { DOCS_TAGS } from "@/core/constants/docs.constants.js";
import { documentRoutes } from "@/core/docs/document-routes.js";
import { BoardAccess } from "../boards/board-access.js";
import { BoardsRepository } from "../boards/boards.repository.js";
import { LabelsController } from "./labels.controller.js";
import { LabelsRepository } from "./labels.repository.js";
import labelsRoutes from "./labels.routes.js";
import { LabelsService } from "./labels.service.js";

const labelsModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new LabelsRepository(fastify.db);
  const boardAccess = new BoardAccess(new BoardsRepository(fastify.db));
  const service = new LabelsService(repository, boardAccess);
  const controller = new LabelsController(service);

  fastify.addHook("onRequest", fastify.authenticate);
  documentRoutes({ fastify, tag: DOCS_TAGS.labels, secured: true });

  fastify.decorate("labelsController", controller);
  await fastify.register(labelsRoutes, { prefix: "/labels" });
};

export default labelsModule;
