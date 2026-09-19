import type { JWT } from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import type { EnvConfig } from "@/types/fastify.js";
import {
  AUTH_COOKIE_PATHS,
  AUTH_TOKENS,
  AUTH_TOKENS_TTL,
} from "./auth.constants.js";
import { NoRefreshTokenError } from "./auth.errors.js";
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

  private clearAuthCookiesOnError = async <T>({
    reply,
    run,
  }: {
    reply: FastifyReply;
    run: () => Promise<T>;
  }) => {
    try {
      return await run();
    } catch (error) {
      this.clearAuthCookies(reply);
      throw error;
    }
  };

  signUp = async (
    req: FastifyRequest<{ Body: AuthSignUpBody }>,
    reply: FastifyReply,
  ) => {
    const { user, refreshToken } = await this.service.signUp(req.body);

    const accessToken = this.jwt.sign({ id: user.id, role: user.role });

    this.setAuthCookies(reply, { accessToken, refreshToken });

    return reply.code(HTTP_STATUS.created).send(user);
  };

  signIn = async (
    req: FastifyRequest<{ Body: AuthSignInBody }>,
    reply: FastifyReply,
  ) => {
    const user = await this.service.signIn(req.body);

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
      throw new NoRefreshTokenError();
    }

    const { user, refreshToken } = await this.clearAuthCookiesOnError({
      reply,
      run: () => this.service.rotateSession({ token }),
    });
    const accessToken = this.jwt.sign({ id: user.id, role: user.role });

    this.setAuthCookies(reply, { accessToken, refreshToken });

    return reply.code(HTTP_STATUS.noContent).send();
  };

  me = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = await this.clearAuthCookiesOnError({
      reply,
      run: () => this.service.me({ userId: req.user.id }),
    });

    return reply.send(user);
  };

  logout = async (req: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = req.cookies[AUTH_TOKENS.refreshToken];

    if (refreshToken) {
      await this.service.revokeSession({ token: refreshToken });
    }

    this.clearAuthCookies(reply);
    return reply.code(HTTP_STATUS.noContent).send();
  };

  changePassword = async (
    req: FastifyRequest<{ Body: AuthChangePasswordBody }>,
    reply: FastifyReply,
  ) => {
    await this.service.changePassword({ ...req.body, userId: req.user.id });

    return reply.code(HTTP_STATUS.noContent).send();
  };
}
