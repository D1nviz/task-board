import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import {
  LabelByBoardIdParamsSchema,
  LabelCreateBodySchema,
  LabelIdParamsSchema,
  LabelResponseSchema,
  LabelUpdateBodySchema,
} from "./labels.schema.js";

const labelsRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { labelsController } = fastify;

  fastify.get("/by-board/:boardId", {
    schema: {
      params: LabelByBoardIdParamsSchema,
      response: {
        200: Type.Array(LabelResponseSchema),
      },
    },
    handler: labelsController.getAllByBoardId,
  });

  fastify.get("/:id", {
    schema: {
      params: LabelIdParamsSchema,
    },
    handler: labelsController.getById,
  });

  fastify.post("/", {
    schema: {
      body: LabelCreateBodySchema,
    },
    handler: labelsController.create,
  });

  fastify.patch("/:id", {
    schema: {
      params: LabelIdParamsSchema,
      body: LabelUpdateBodySchema,
    },
    handler: labelsController.update,
  });

  fastify.delete("/:id", {
    schema: {
      params: LabelIdParamsSchema,
    },
    handler: labelsController.delete,
  });
};

export default labelsRoutes;
