import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  TaskByBoardIdSchema,
  TaskByColumnIdSchema,
  TaskCreateBodySchema,
  TaskIdParamsSchema,
  TaskLabelParamsSchema,
} from "./tasks.schema.js";

const tasksRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { tasksController } = fastify;

  fastify.get("/by-board/:boardId", {
    schema: {
      params: TaskByBoardIdSchema,
    },
    handler: tasksController.getAllByBoardId,
  });

  fastify.get("/by-column/:columnId", {
    schema: {
      params: TaskByColumnIdSchema,
    },
    handler: tasksController.getAllByColumnId,
  });

  fastify.post("/", {
    schema: {
      body: TaskCreateBodySchema,
    },
    handler: tasksController.create,
  });

  fastify.delete("/:id", {
    schema: {
      params: TaskIdParamsSchema,
    },
    handler: tasksController.delete,
  });

  fastify.put("/:taskId/labels/:labelId", {
    schema: {
      params: TaskLabelParamsSchema,
    },
    handler: tasksController.attachLabel,
  });

  fastify.delete("/:taskId/labels/:labelId", {
    schema: {
      params: TaskLabelParamsSchema,
    },
    handler: tasksController.detachLabel,
  });
};

export default tasksRoutes;
