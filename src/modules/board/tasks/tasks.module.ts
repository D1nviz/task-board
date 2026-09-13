import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { TasksController } from "./tasks.controller.js";
import { TasksRepository } from "./tasks.repository.js";
import tasksRoutes from "./tasks.routes.js";
import { TasksService } from "./tasks.service.js";

const tasksModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new TasksRepository(fastify.db);
  const service = new TasksService(repository);
  const controller = new TasksController(service);

  fastify.addHook("onRequest", fastify.authenticate);

  fastify.decorate("tasksController", controller);
  await fastify.register(tasksRoutes, { prefix: "/tasks" });
};

export default tasksModule;
