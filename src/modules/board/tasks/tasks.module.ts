import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { DOCS_TAGS } from "@/core/constants/docs.constants.js";
import { documentRoutes } from "@/core/docs/document-routes.js";
import { BoardAccess } from "../boards/board-access.js";
import { BoardsRepository } from "../boards/boards.repository.js";
import { TasksController } from "./tasks.controller.js";
import { TasksRepository } from "./tasks.repository.js";
import tasksRoutes from "./tasks.routes.js";
import { TasksService } from "./tasks.service.js";

const tasksModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new TasksRepository(fastify.db);
  const boardAccess = new BoardAccess(new BoardsRepository(fastify.db));
  const service = new TasksService(repository, boardAccess);
  const controller = new TasksController(service);

  fastify.addHook("onRequest", fastify.authenticate);
  documentRoutes({ fastify, tag: DOCS_TAGS.tasks, secured: true });

  fastify.decorate("tasksController", controller);
  await fastify.register(tasksRoutes, { prefix: "/tasks" });
};

export default tasksModule;
