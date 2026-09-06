import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { BoardCreateBodySchema, BoardResponseSchema } from "./boards.schema.js";

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

  fastify.post("/", {
    schema: {
      body: BoardCreateBodySchema,
    },
    handler: boardsController.create,
  });
};

export default boardsRoutes;
