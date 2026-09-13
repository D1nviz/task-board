import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { NotesController } from "./notes.controller.js";
import { NotesRepository } from "./notes.repository.js";
import notesRoutes from "./notes.routes.js";
import { NotesService } from "./notes.service.js";

const notesModule: FastifyPluginAsyncTypebox = async (fastify) => {
  const repository = new NotesRepository(fastify.db);
  const service = new NotesService(repository);
  const controller = new NotesController(service);

  fastify.addHook("onRequest", fastify.authenticate);

  fastify.decorate("notesController", controller);
  await fastify.register(notesRoutes, { prefix: "/notes" });
};

export default notesModule;
