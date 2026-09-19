import type { FastifyReply, FastifyRequest } from "fastify";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import type {
  NoteCreateBody,
  NoteIdParams,
  NoteUpdateBody,
} from "./notes.schema.js";
import type { NotesService } from "./notes.service.js";

export class NotesController {
  constructor(private service: NotesService) {}

  getAll = async (req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(await this.service.getAll({ userId: req.user.id }));
  };

  getById = async (
    req: FastifyRequest<{ Params: NoteIdParams }>,
    reply: FastifyReply,
  ) => {
    return reply.send(
      await this.service.getById({ ...req.params, userId: req.user.id }),
    );
  };

  create = async (
    req: FastifyRequest<{ Body: NoteCreateBody }>,
    reply: FastifyReply,
  ) => {
    const note = await this.service.create({
      ...req.body,
      userId: req.user.id,
    });

    return reply.code(HTTP_STATUS.created).send(note);
  };

  update = async (
    req: FastifyRequest<{ Params: NoteIdParams; Body: NoteUpdateBody }>,
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
    req: FastifyRequest<{ Params: NoteIdParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.delete({ ...req.params, userId: req.user.id });
    return reply.code(HTTP_STATUS.noContent).send();
  };
}
