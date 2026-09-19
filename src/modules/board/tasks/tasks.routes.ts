import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { ErrorResponseSchema } from "@/core/errors/index.js";
import {
  TaskByBoardIdParamsSchema,
  TaskByColumnIdParamsSchema,
  TaskCreateBodySchema,
  TaskDetailsResponseSchema,
  TaskIdParamsSchema,
  TaskLabelParamsSchema,
  TaskResponseSchema,
  TaskUpdateBodySchema,
} from "./tasks.schema.js";

const tasksRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { tasksController } = fastify;

  fastify.get("/by-board/:boardId", {
    schema: {
      summary: "List tasks of a board with labels and column",
      params: TaskByBoardIdParamsSchema,
      response: {
        [HTTP_STATUS.ok]: Type.Array(TaskDetailsResponseSchema),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: tasksController.getAllByBoardId,
  });

  fastify.get("/by-column/:columnId", {
    schema: {
      summary: "List tasks of a column with labels",
      params: TaskByColumnIdParamsSchema,
      response: {
        [HTTP_STATUS.ok]: Type.Array(TaskDetailsResponseSchema),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: tasksController.getAllByColumnId,
  });

  fastify.get("/:id", {
    schema: {
      summary: "Get a task with labels and column",
      params: TaskIdParamsSchema,
      response: {
        [HTTP_STATUS.ok]: TaskDetailsResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: tasksController.getById,
  });

  fastify.post("/", {
    schema: {
      summary: "Create a task, the column must belong to the same board",
      body: TaskCreateBodySchema,
      response: {
        [HTTP_STATUS.created]: TaskResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: tasksController.create,
  });

  fastify.patch("/:id", {
    schema: {
      summary: "Update a task or move it to another column of its board",
      params: TaskIdParamsSchema,
      body: TaskUpdateBodySchema,
      response: {
        [HTTP_STATUS.ok]: TaskResponseSchema,
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: tasksController.update,
  });

  fastify.delete("/:id", {
    schema: {
      summary: "Delete a task",
      params: TaskIdParamsSchema,
      response: {
        [HTTP_STATUS.noContent]: Type.Null(),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: tasksController.delete,
  });

  fastify.put("/:taskId/labels/:labelId", {
    schema: {
      summary: "Attach a label of the same board, idempotent",
      params: TaskLabelParamsSchema,
      response: {
        [HTTP_STATUS.noContent]: Type.Null(),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: tasksController.attachLabel,
  });

  fastify.delete("/:taskId/labels/:labelId", {
    schema: {
      summary: "Detach a label, idempotent",
      params: TaskLabelParamsSchema,
      response: {
        [HTTP_STATUS.noContent]: Type.Null(),
        [HTTP_STATUS.notFound]: ErrorResponseSchema,
      },
    },
    handler: tasksController.detachLabel,
  });
};

export default tasksRoutes;
