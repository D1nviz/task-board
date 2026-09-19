import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { ErrorResponseSchema } from "@/core/errors/index.js";
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
      summary: "List labels of a board",
      params: LabelByBoardIdParamsSchema,
      response: {
        [HTTP_STATUS.ok]: Type.Array(LabelResponseSchema),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: labelsController.getAllByBoardId,
  });

  fastify.get("/:id", {
    schema: {
      summary: "Get a label",
      params: LabelIdParamsSchema,
      response: {
        [HTTP_STATUS.ok]: LabelResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: labelsController.getById,
  });

  fastify.post("/", {
    schema: {
      summary: "Create a label, names are unique per board",
      body: LabelCreateBodySchema,
      response: {
        [HTTP_STATUS.created]: LabelResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
        [HTTP_STATUS.conflict]: ErrorResponseSchema,
      },
    },
    handler: labelsController.create,
  });

  fastify.patch("/:id", {
    schema: {
      summary: "Rename a label",
      params: LabelIdParamsSchema,
      body: LabelUpdateBodySchema,
      response: {
        [HTTP_STATUS.ok]: LabelResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
        [HTTP_STATUS.conflict]: ErrorResponseSchema,
      },
    },
    handler: labelsController.update,
  });

  fastify.delete("/:id", {
    schema: {
      summary: "Delete a label and detach it from tasks",
      params: LabelIdParamsSchema,
      response: {
        [HTTP_STATUS.noContent]: Type.Null(),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: labelsController.delete,
  });
};

export default labelsRoutes;
