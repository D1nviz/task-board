import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthSignUpBodyParams } from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private service: AuthService) {}

  signUp = async (
    req: FastifyRequest<{ Body: AuthSignUpBodyParams }>,
    reply: FastifyReply,
  ) => {
    const user = await this.service.signUp(req.body);

    return reply.code(201).send(user);
  };
}
