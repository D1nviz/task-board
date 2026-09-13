import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import {
  NoteCreateBodySchema,
  NoteIdParamsSchema,
  NoteResponseSchema,
  NoteUpdateBodySchema,
} from "./notes.schema.js";

const notesRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { notesController } = fastify;

  fastify.get("/", {
    schema: {
      response: {
        200: Type.Array(NoteResponseSchema),
      },
    },
    handler: notesController.getAll,
  });

  fastify.post("/", {
    schema: {
      body: NoteCreateBodySchema,
      response: {
        201: NoteResponseSchema,
      },
    },
    handler: notesController.create,
  });

  fastify.patch("/:id", {
    schema: {
      params: NoteIdParamsSchema,
      body: NoteUpdateBodySchema,
    },
    handler: notesController.update,
  });

  fastify.delete("/:id", {
    schema: {
      params: NoteIdParamsSchema,
    },
    handler: notesController.delete,
  });
};

export default notesRoutes;
