import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { ColumnsController } from "./columns.controller.js";
import { ColumnsRepository } from "./columns.repository.js";
import columnsRoutes from "./columns.routes.js";
import { ColumnsService } from "./columns.service.js";

const columnsModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new ColumnsRepository(fastify.db);
  const service = new ColumnsService(repository);
  const controller = new ColumnsController(service);

  fastify.addHook("onRequest", fastify.authenticate);

  fastify.decorate("columnsController", controller);
  await fastify.register(columnsRoutes, { prefix: "/columns" });
};

export default columnsModule;
