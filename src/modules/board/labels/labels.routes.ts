import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import {
  LabelCreateBodySchema,
  LabelIdParamsSchema,
  LabelResponseSchema,
  LabelUpdateBodySchema,
} from "./labels.schema.js";

const labelsRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { labelsController } = fastify;

  fastify.get("/", {
    schema: {
      response: {
        200: Type.Array(LabelResponseSchema),
      },
    },
    handler: labelsController.getAll,
  });

  fastify.post("/", {
    schema: {
      body: LabelCreateBodySchema,
      response: {
        201: LabelResponseSchema,
      },
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
