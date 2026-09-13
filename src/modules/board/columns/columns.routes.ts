import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import {
  ColumnByBoardIdParamsSchema,
  ColumnCreateBodySchema,
  ColumnIdParamsSchema,
  ColumnResponseSchema,
  ColumnUpdateBodySchema,
} from "./columns.schema.js";

const columnsRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { columnsController } = fastify;

  fastify.get("/by-board/:boardId", {
    schema: {
      params: ColumnByBoardIdParamsSchema,
      response: {
        200: Type.Array(ColumnResponseSchema),
      },
    },
    handler: columnsController.getAllByBoardId,
  });

  fastify.get("/:id", {
    schema: {
      params: ColumnIdParamsSchema,
    },
    handler: columnsController.getById,
  });

  fastify.post("/", {
    schema: {
      body: ColumnCreateBodySchema,
    },
    handler: columnsController.create,
  });

  fastify.patch("/:id", {
    schema: {
      params: ColumnIdParamsSchema,
      body: ColumnUpdateBodySchema,
    },
    handler: columnsController.update,
  });

  fastify.delete("/:id", {
    schema: {
      params: ColumnIdParamsSchema,
    },
    handler: columnsController.delete,
  });
};

export default columnsRoutes;
