import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { ErrorResponseSchema } from "@/core/errors/index.js";
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
      summary: "List columns of a board",
      params: ColumnByBoardIdParamsSchema,
      response: {
        [HTTP_STATUS.ok]: Type.Array(ColumnResponseSchema),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: columnsController.getAllByBoardId,
  });

  fastify.get("/:id", {
    schema: {
      summary: "Get a column",
      params: ColumnIdParamsSchema,
      response: {
        [HTTP_STATUS.ok]: ColumnResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: columnsController.getById,
  });

  fastify.post("/", {
    schema: {
      summary: "Create a column",
      body: ColumnCreateBodySchema,
      response: {
        [HTTP_STATUS.created]: ColumnResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: columnsController.create,
  });

  fastify.patch("/:id", {
    schema: {
      summary: "Update a column",
      params: ColumnIdParamsSchema,
      body: ColumnUpdateBodySchema,
      response: {
        [HTTP_STATUS.ok]: ColumnResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: columnsController.update,
  });

  fastify.delete("/:id", {
    schema: {
      summary: "Delete a column, its tasks stay on the board without a column",
      params: ColumnIdParamsSchema,
      response: {
        [HTTP_STATUS.noContent]: Type.Null(),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: columnsController.delete,
  });
};

export default columnsRoutes;
