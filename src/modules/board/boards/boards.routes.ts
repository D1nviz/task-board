import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { ErrorResponseSchema } from "@/core/errors/index.js";
import {
  BoardCreateBodySchema,
  BoardIdParamsSchema,
  BoardResponseSchema,
  BoardUpdateBodySchema,
} from "./boards.schema.js";

const boardsRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { boardsController } = fastify;

  fastify.get("/", {
    schema: {
      summary: "List boards of the current user",
      response: {
        [HTTP_STATUS.ok]: Type.Array(BoardResponseSchema),
      },
    },
    handler: boardsController.getAll,
  });

  fastify.get("/:id", {
    schema: {
      summary: "Get a board",
      params: BoardIdParamsSchema,
      response: {
        [HTTP_STATUS.ok]: BoardResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: boardsController.getById,
  });

  fastify.post("/", {
    schema: {
      summary: "Create a board",
      body: BoardCreateBodySchema,
      response: {
        [HTTP_STATUS.created]: BoardResponseSchema,
      },
    },
    handler: boardsController.create,
  });

  fastify.patch("/:id", {
    schema: {
      summary: "Update a board",
      params: BoardIdParamsSchema,
      body: BoardUpdateBodySchema,
      response: {
        [HTTP_STATUS.ok]: BoardResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: boardsController.update,
  });

  fastify.delete("/:id", {
    schema: {
      summary: "Delete a board with its columns, labels and tasks",
      params: BoardIdParamsSchema,
      response: {
        [HTTP_STATUS.noContent]: Type.Null(),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: boardsController.delete,
  });
};

export default boardsRoutes;
