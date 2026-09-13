import type { FastifyReply, FastifyRequest } from "fastify";
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

  create = async (
    req: FastifyRequest<{ Body: NoteCreateBody }>,
    reply: FastifyReply,
  ) => {
    const [note] = await this.service.create({
      ...req.body,
      userId: req.user.id,
    });

    return reply.code(201).send(note);
  };

  update = async (
    req: FastifyRequest<{ Params: NoteIdParams; Body: NoteUpdateBody }>,
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
    req: FastifyRequest<{ Params: NoteIdParams }>,
    reply: FastifyReply,
  ) => {
    await this.service.delete({ ...req.params, userId: req.user.id });

    return reply.code(204).send();
  };
}
