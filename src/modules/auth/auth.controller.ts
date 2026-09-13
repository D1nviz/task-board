import type { JWT } from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { EnvConfig } from "../../types/fastify.js";
import { ACCESS_TOKEN_TTL, AUTH_TOKENS } from "./auth.constants.js";
import type {
  AuthChangePasswordBody,
  AuthSignInBody,
  AuthSignUpBody,
} from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly jwt: JWT,
    private readonly config: EnvConfig,
  ) {}

  private setAuthCookie = (
    reply: FastifyReply,
    user: { id: number; role: "admin" | "user" },
  ) => {
    const accessToken = this.jwt.sign({ id: user.id, role: user.role });

    reply.setCookie(AUTH_TOKENS.accessToken, accessToken, {
      httpOnly: true,
      secure: this.config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_TTL,
      path: "/",
    });
  };

  signUp = async (
    req: FastifyRequest<{ Body: AuthSignUpBody }>,
    reply: FastifyReply,
  ) => {
    const user = await this.service.signUp(req.body);

    this.setAuthCookie(reply, user);

    return reply.code(201).send(user);
  };

  signIn = async (
    req: FastifyRequest<{ Body: AuthSignInBody }>,
    reply: FastifyReply,
  ) => {
    const user = await this.service.signIn(req.body);

    if (!user) {
      return reply.code(401).send({ message: "Invalid email or password" });
    }

    this.setAuthCookie(reply, user);

    return reply.send(user);
  };

  me = async (req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(await this.service.me({ userId: req.user.id }));
  };

  logout = async (_req: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie(AUTH_TOKENS.accessToken, { path: "/" });

    return reply.code(204).send();
  };

  changePassword = async (
    req: FastifyRequest<{ Body: AuthChangePasswordBody }>,
    reply: FastifyReply,
  ) => {
    const result = await this.service.changePassword({
      ...req.body,
      userId: req.user.id,
    });

    if (!result) {
      return reply.code(401).send({ message: "Invalid current password" });
    }

    return reply.code(204).send();
  };
}
