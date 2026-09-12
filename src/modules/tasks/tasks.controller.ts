import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  TaskByBoardIdParams,
  TaskByColumnIdParams,
  TaskCreateBodyParams,
} from "./tasks.schema.js";
import type { TasksService } from "./tasks.service.js";

export class TasksController {
  constructor(private service: TasksService) {}

  getAllByBoardId = async (
    req: FastifyRequest<{ Params: TaskByBoardIdParams }>,
    reply: FastifyReply,
  ) => {
    const { boardId } = req.params;
    const res = await this.service.getAllByBoardId({ boardId });
    reply.send(res);
  };

  getAllByColumnId = async (
    req: FastifyRequest<{ Params: TaskByColumnIdParams }>,
    reply: FastifyReply,
  ) => {
    const { columnId } = req.params;
    const res = await this.service.getAllByColumnId({ columnId });
    reply.send(res);
  };
  create = async (
    req: FastifyRequest<{ Body: TaskCreateBodyParams }>,
    reply: FastifyReply,
  ) => {
    const res = await this.service.create(req.body);
    reply.send(res);
  };
}
