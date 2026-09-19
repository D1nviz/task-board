import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { ErrorResponseSchema } from "@/core/errors/index.js";
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
      summary: "List notes of the current user",
      response: {
        [HTTP_STATUS.ok]: Type.Array(NoteResponseSchema),
      },
    },
    handler: notesController.getAll,
  });

  fastify.get("/:id", {
    schema: {
      summary: "Get a note",
      params: NoteIdParamsSchema,
      response: {
        [HTTP_STATUS.ok]: NoteResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: notesController.getById,
  });

  fastify.post("/", {
    schema: {
      summary: "Create a note",
      body: NoteCreateBodySchema,
      response: {
        [HTTP_STATUS.created]: NoteResponseSchema,
      },
    },
    handler: notesController.create,
  });

  fastify.patch("/:id", {
    schema: {
      summary: "Update a note",
      params: NoteIdParamsSchema,
      body: NoteUpdateBodySchema,
      response: {
        [HTTP_STATUS.ok]: NoteResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: notesController.update,
  });

  fastify.delete("/:id", {
    schema: {
      summary: "Delete a note",
      params: NoteIdParamsSchema,
      response: {
        [HTTP_STATUS.noContent]: Type.Null(),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: notesController.delete,
  });
};

export default notesRoutes;
