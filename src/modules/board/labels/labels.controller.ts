import type { FastifyReply, FastifyRequest } from "fastify";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import type {
  LabelByBoardIdParams,
  LabelCreateBody,
  LabelIdParams,
  LabelUpdateBody,
} from "./labels.schema.js";
import type { LabelsService } from "./labels.service.js";

export class LabelsController {
  constructor(private service: LabelsService) {}

  getAllByBoardId = async (
    req: FastifyRequest<{ Params: LabelByBoardIdParams }>,
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
    req: FastifyRequest<{ Params: LabelIdParams }>,
    reply: FastifyReply,
  ) => {
    return reply.send(
      await this.service.getById({ ...req.params, userId: req.user.id }),
    );
  };

  create = async (
    req: FastifyRequest<{ Body: LabelCreateBody }>,
    reply: FastifyReply,
  ) => {
    const label = await this.service.create({
      ...req.body,
      userId: req.user.id,
    });

    return reply.code(HTTP_STATUS.created).send(label);
  };

  update = async (
    req: FastifyRequest<{ Params: LabelIdParams; Body: LabelUpdateBody }>,
    reply: FastifyReply,
  ) => {
    return reply.send(
      await this.service.update({
        ...req.params,
        ...req.body,
        userId: req.user.id,
      }),
    );
  };

  delete = async (
    req: FastifyRequest<{ Params: LabelIdParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.delete({ ...req.params, userId: req.user.id });
    return reply.code(HTTP_STATUS.noContent).send();
  };
}
