import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  TaskByBoardIdParamsSchema,
  TaskByColumnIdParamsSchema,
  TaskCreateBodySchema,
  TaskIdParamsSchema,
  TaskLabelParamsSchema,
  TaskUpdateBodySchema,
} from "./tasks.schema.js";

const tasksRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { tasksController } = fastify;

  fastify.get("/by-board/:boardId", {
    schema: {
      params: TaskByBoardIdParamsSchema,
    },
    handler: tasksController.getAllByBoardId,
  });

  fastify.get("/by-column/:columnId", {
    schema: {
      params: TaskByColumnIdParamsSchema,
    },
    handler: tasksController.getAllByColumnId,
  });

  fastify.get("/:id", {
    schema: {
      params: TaskIdParamsSchema,
    },
    handler: tasksController.getById,
  });

  fastify.post("/", {
    schema: {
      body: TaskCreateBodySchema,
    },
    handler: tasksController.create,
  });

  fastify.patch("/:id", {
    schema: {
      params: TaskIdParamsSchema,
      body: TaskUpdateBodySchema,
    },
    handler: tasksController.update,
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
