import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  BoardCreateBody,
  BoardIdParams,
  BoardUpdateBody,
} from "./boards.schema.js";
import type { BoardsService } from "./boards.sevice.js";

export class BoardsController {
  constructor(private service: BoardsService) {}

  getById = async (
    req: FastifyRequest<{ Params: BoardIdParams }>,
    reply: FastifyReply,
  ) => {
    const [board] = await this.service.getById({
      ...req.params,
      userId: req.user.id,
    });

    return reply.send(board);
  };

  create = async (
    req: FastifyRequest<{ Body: BoardCreateBody }>,
    reply: FastifyReply,
  ) => {
    const [board] = await this.service.create({
      ...req.body,
      userId: req.user.id,
    });

    return reply.code(201).send(board);
  };

  getAll = async (req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(await this.service.getAll({ userId: req.user.id }));
  };

  update = async (
    req: FastifyRequest<{ Params: BoardIdParams; Body: BoardUpdateBody }>,
    reply: FastifyReply,
  ) => {
    const [row] = await this.service.update({
      ...req.params,
      ...req.body,
      userId: req.user.id,
    });

    return reply.send(row);
  };

  delete = async (
    req: FastifyRequest<{ Params: BoardIdParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.delete({ ...req.params, userId: req.user.id });
    return reply.code(204).send();
  };
}
