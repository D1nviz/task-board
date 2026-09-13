import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ColumnByBoardIdParams,
  ColumnCreateBody,
  ColumnIdParams,
  ColumnUpdateBody,
} from "./columns.schema.js";
import type { ColumnsService } from "./columns.service.js";

export class ColumnsController {
  constructor(private service: ColumnsService) {}

  getAllByBoardId = async (
    req: FastifyRequest<{ Params: ColumnByBoardIdParams }>,
    reply: FastifyReply,
  ) => {
    return reply.send(
      await this.service.getAllByBoardId({
        ...req.params,
        userId: req.user.id,
      }),
    );
  };

  getById = async (
    req: FastifyRequest<{ Params: ColumnIdParams }>,
    reply: FastifyReply,
  ) => {
    const [column] = await this.service.getById({
      ...req.params,
      userId: req.user.id,
    });

    return reply.send(column);
  };

  create = async (
    req: FastifyRequest<{ Body: ColumnCreateBody }>,
    reply: FastifyReply,
  ) => {
    const [column] = await this.service.create({
      ...req.body,
      userId: req.user.id,
    });

    return reply.code(201).send(column);
  };

  update = async (
    req: FastifyRequest<{ Params: ColumnIdParams; Body: ColumnUpdateBody }>,
    reply: FastifyReply,
  ) => {
    const [column] = await this.service.update({
      ...req.params,
      ...req.body,
      userId: req.user.id,
    });

    return reply.send(column);
  };

  delete = async (
    req: FastifyRequest<{ Params: ColumnIdParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.delete({ ...req.params, userId: req.user.id });

    return reply.code(204).send();
  };
}
