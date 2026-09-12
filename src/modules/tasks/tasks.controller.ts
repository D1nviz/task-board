import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  TaskByBoardIdParams,
  TaskByColumnIdParams,
  TaskCreateBodyParams,
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
    const { boardId } = req.params;
    return reply.send(await this.service.getAllByBoardId({ boardId }));
  };

  getAllByColumnId = async (
    req: FastifyRequest<{ Params: TaskByColumnIdParams }>,
    reply: FastifyReply,
  ) => {
    const { columnId } = req.params;
    return reply.send(await this.service.getAllByColumnId({ columnId }));
  };

  create = async (
    req: FastifyRequest<{ Body: TaskCreateBodyParams }>,
    reply: FastifyReply,
  ) => {
    const [task] = await this.service.create(req.body);
    return reply.code(201).send(task);
  };

  delete = async (
    req: FastifyRequest<{ Params: TaskIdParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.delete(req.params);
    return reply.code(204).send();
  };

  attachLabel = async (
    req: FastifyRequest<{ Params: TaskLabelParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.attachLabel(req.params);
    return reply.code(204).send();
  };

  detachLabel = async (
    req: FastifyRequest<{ Params: TaskLabelParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.detachLabel(req.params);
    return reply.code(204).send();
  };
}
