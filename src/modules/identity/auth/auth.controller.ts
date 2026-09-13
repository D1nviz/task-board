import type { JWT } from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { EnvConfig } from "@/types/fastify.js";
import {
  AUTH_COOKIE_PATHS,
  AUTH_TOKENS,
  AUTH_TOKENS_TTL,
} from "./auth.constants.js";
import type {
  AuthChangePasswordBody,
  AuthSignInBody,
  AuthSignUpBody,
  AuthTokenPair,
} from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly jwt: JWT,
    private readonly config: EnvConfig,
  ) {}

  private setAuthCookies = (
    reply: FastifyReply,
    { accessToken, refreshToken }: AuthTokenPair,
  ) => {
    const secure = this.config.NODE_ENV === "production";

    reply.setCookie(AUTH_TOKENS.accessToken, accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: AUTH_TOKENS_TTL[AUTH_TOKENS.accessToken],
      path: AUTH_COOKIE_PATHS[AUTH_TOKENS.accessToken],
    });

    reply.setCookie(AUTH_TOKENS.refreshToken, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      maxAge: AUTH_TOKENS_TTL[AUTH_TOKENS.refreshToken],
      path: AUTH_COOKIE_PATHS[AUTH_TOKENS.refreshToken],
    });
  };

  private clearAuthCookies = (reply: FastifyReply) => {
    reply.clearCookie(AUTH_TOKENS.accessToken, {
      path: AUTH_COOKIE_PATHS[AUTH_TOKENS.accessToken],
    });
    reply.clearCookie(AUTH_TOKENS.refreshToken, {
      path: AUTH_COOKIE_PATHS[AUTH_TOKENS.refreshToken],
    });
  };

  signUp = async (
    req: FastifyRequest<{ Body: AuthSignUpBody }>,
    reply: FastifyReply,
  ) => {
    const { user, refreshToken } = await this.service.signUp(req.body);

    const accessToken = this.jwt.sign({ id: user.id, role: user.role });

    this.setAuthCookies(reply, { accessToken, refreshToken });

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

    const accessToken = this.jwt.sign({ id: user.id, role: user.role });

    const { refreshToken } = await this.service.issueRefreshToken({
      userId: user.id,
    });

    this.setAuthCookies(reply, { accessToken, refreshToken });

    return reply.send(user);
  };

  refresh = async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.cookies[AUTH_TOKENS.refreshToken];

    if (!token) {
      return reply.code(401).send({ message: "No refresh token" });
    }

    const result = await this.service.rotateSession({ token });

    if (result.status === "reuse") {
      req.log.warn(
        { userId: result.userId, familyId: result.familyId },
        "refresh token reuse detected, family revoked",
      );
    }

    if (result.status !== "ok") {
      this.clearAuthCookies(reply);

      return reply.code(401).send({
        message:
          result.status === "reuse" ? "Token reuse detected" : "Invalid token",
      });
    }

    const accessToken = this.jwt.sign({
      id: result.user.id,
      role: result.user.role,
    });

    this.setAuthCookies(reply, {
      accessToken,
      refreshToken: result.refreshToken,
    });

    return reply.code(204).send();
  };

  me = async (req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(await this.service.me({ userId: req.user.id }));
  };

  logout = async (req: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = req.cookies[AUTH_TOKENS.refreshToken];

    if (refreshToken) {
      await this.service.revokeSession({ token: refreshToken });
    }

    this.clearAuthCookies(reply);
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
