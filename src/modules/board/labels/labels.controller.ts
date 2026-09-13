import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  LabelCreateBody,
  LabelIdParams,
  LabelUpdateBody,
} from "./labels.schema.js";
import type { LabelsService } from "./labels.service.js";

export class LabelsController {
  constructor(private service: LabelsService) {}

  getAll = async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(await this.service.getAll());
  };

  create = async (
    req: FastifyRequest<{ Body: LabelCreateBody }>,
    reply: FastifyReply,
  ) => {
    const [label] = await this.service.create(req.body);
    return reply.code(201).send(label);
  };

  update = async (
    req: FastifyRequest<{ Params: LabelIdParams; Body: LabelUpdateBody }>,
    reply: FastifyReply,
  ) => {
    const [row] = await this.service.update({
      ...req.params,
      ...req.body,
    });

    return reply.send(row);
  };

  delete = async (
    req: FastifyRequest<{ Params: LabelIdParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.delete(req.params);
    return reply.code(204).send();
  };
}
