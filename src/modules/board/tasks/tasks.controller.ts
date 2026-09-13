import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  TaskByBoardIdParams,
  TaskByColumnIdParams,
  TaskCreateBody,
  TaskIdParams,
  TaskLabelParams,
} from "./tasks.schema.js";
import type { TasksService } from "./tasks.service.js";

export class TasksController {
  constructor(private service: TasksService) {}

  getAllByBoardId = async (
    req: FastifyRequest<{ Params: TaskByBoardIdParams }>,
    reply: FastifyReply,
  ) => {
    return reply.send(
      await this.service.getAllByBoardId({
        ...req.params,
        userId: req.user.id,
      }),
    );
  };

  getAllByColumnId = async (
    req: FastifyRequest<{ Params: TaskByColumnIdParams }>,
    reply: FastifyReply,
  ) => {
    return reply.send(
      await this.service.getAllByColumnId({
        ...req.params,
        userId: req.user.id,
      }),
    );
  };

  create = async (
    req: FastifyRequest<{ Body: TaskCreateBody }>,
    reply: FastifyReply,
  ) => {
    const [task] = await this.service.create({
      ...req.body,
      userId: req.user.id,
    });
    return reply.code(201).send(task);
  };

  delete = async (
    req: FastifyRequest<{ Params: TaskIdParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.delete({ ...req.params, userId: req.user.id });
    return reply.code(204).send();
  };

  attachLabel = async (
    req: FastifyRequest<{ Params: TaskLabelParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.attachLabel({ ...req.params, userId: req.user.id });
    return reply.code(204).send();
  };

  detachLabel = async (
    req: FastifyRequest<{ Params: TaskLabelParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.detachLabel({ ...req.params, userId: req.user.id });
    return reply.code(204).send();
  };
}
