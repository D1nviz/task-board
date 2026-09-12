import type { FastifyReply, FastifyRequest } from "fastify";
import type { BoardCreateBody, BoardIdParams } from "./boards.schema.js";
import type { BoardsService } from "./boards.sevice.js";

export class BoardsController {
  constructor(private service: BoardsService) {}

  create = async (
    req: FastifyRequest<{ Body: BoardCreateBody }>,
    reply: FastifyReply,
  ) => {
    const data = req.body;
    const result = await this.service.create(data);
    return reply.send(result);
  };

  getAll = async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(await this.service.getAll());
  };

  delete = async (
    req: FastifyRequest<{ Params: BoardIdParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.delete(req.params);
    return reply.code(204).send();
  };
}
