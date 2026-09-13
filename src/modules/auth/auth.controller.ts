import type { JWT } from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { EnvConfig } from "../../types/fastify.js";
import { ACCESS_TOKEN_TTL, AUTH_TOKENS } from "./auth.constants.js";
import type { AuthSignUpBodyParams } from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly jwt: JWT,
    private readonly config: EnvConfig,
  ) {}

  signUp = async (
    req: FastifyRequest<{ Body: AuthSignUpBodyParams }>,
    reply: FastifyReply,
  ) => {
    const user = await this.service.signUp(req.body);

    const accessToken = this.jwt.sign({ id: user.id, role: user.role });

    reply.setCookie(AUTH_TOKENS.accessToken, accessToken, {
      httpOnly: true,
      secure: this.config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_TTL,
      path: "/",
    });

    return reply.code(201).send(user);
  };
}
