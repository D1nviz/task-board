import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { TasksController } from "./tasks.controller.js";
import { TasksRepository } from "./tasks.repository.js";
import tasksRoutes from "./tasks.routes.js";
import { TasksService } from "./tasks.service.js";

const boardsModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new TasksRepository(fastify.db);
  const service = new TasksService(repository);
  const controller = new TasksController(service);

  fastify.decorate("tasksController", controller);
  await fastify.register(tasksRoutes);
};

export default boardsModule;
