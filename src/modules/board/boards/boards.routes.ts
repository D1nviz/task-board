import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
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
      response: {
        200: Type.Array(BoardResponseSchema),
      },
    },
    handler: boardsController.getAll,
  });

  fastify.get("/:id", {
    schema: {
      params: BoardIdParamsSchema,
    },
    handler: boardsController.getById,
  });

  fastify.post("/", {
    schema: {
      body: BoardCreateBodySchema,
    },
    handler: boardsController.create,
  });

  fastify.patch("/:id", {
    schema: {
      params: BoardIdParamsSchema,
      body: BoardUpdateBodySchema,
    },
    handler: boardsController.update,
  });

  fastify.delete("/:id", {
    schema: {
      params: BoardIdParamsSchema,
    },
    handler: boardsController.delete,
  });
};

export default boardsRoutes;
