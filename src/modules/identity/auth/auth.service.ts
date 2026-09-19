import { createHash, randomBytes, randomUUIDv7 } from "node:crypto";
import argon2 from "argon2";
import { isUniqueViolation } from "@/core/db/errors.js";
import type { Database, Transaction } from "@/core/db/types/index.js";
import type { UsersRepository } from "../users/users.repository.js";
import { USERS_CONSTRAINTS } from "../users/users.table.js";
import { AUTH_TOKENS_TTL } from "./auth.constants.js";
import {
  AuthUserNotFoundError,
  EmailTakenError,
  InvalidCredentialsError,
  InvalidCurrentPasswordError,
  InvalidRefreshTokenError,
  RefreshTokenReuseError,
} from "./auth.errors.js";
import type { AuthRepository } from "./auth.repository.js";
import type {
  AuthChangePasswordInput,
  AuthIssueRefreshTokenInput,
  AuthMeInput,
  AuthRevokeSessionInput,
  AuthRotateSessionInput,
  AuthSignInInput,
  AuthSignUpInput,
} from "./auth.schema.js";

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly db: Database,
  ) {}

  private hashToken = (token: string) =>
    createHash("sha256").update(token).digest("hex");

  issueRefreshToken = async (
    { userId, familyId = randomUUIDv7() }: AuthIssueRefreshTokenInput,
    tx?: Transaction,
  ) => {
    const refreshToken = randomBytes(40).toString("hex");

    await this.repository.createRefreshToken(
      {
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + AUTH_TOKENS_TTL.refreshToken * 1000),
        familyId,
        userId,
      },
      tx,
    );
    return { refreshToken, familyId };
  };

  purgeExpiredSessions = async () => {
    const deleted = await this.repository.deleteExpired();
    return deleted.length;
  };

  revokeSession = async ({ token }: AuthRevokeSessionInput) => {
    const stored = await this.repository.findRefreshToken({
      tokenHash: this.hashToken(token),
    });

    if (!stored) {
      return;
    }
    return this.repository.deleteFamily({ familyId: stored.familyId });
  };

  rotateSession = async ({ token }: AuthRotateSessionInput) => {
    const stored = await this.repository.findRefreshToken({
      tokenHash: this.hashToken(token),
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new InvalidRefreshTokenError();
    }

    if (stored.usedAt) {
      await this.repository.deleteFamily({ familyId: stored.familyId });
      throw new RefreshTokenReuseError({
        userId: stored.userId,
        familyId: stored.familyId,
      });
    }

    const user = await this.usersRepository.findById({ id: stored.userId });

    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    return this.db.transaction(async (tx) => {
      await this.repository.markRefreshTokenUsed({ id: stored.id }, tx);

      const { refreshToken } = await this.issueRefreshToken(
        { userId: stored.userId, familyId: stored.familyId },
        tx,
      );

      return { user, refreshToken };
    });
  };

  signUp = async (data: AuthSignUpInput) => {
    const passwordHash = await argon2.hash(data.password);

    try {
      return await this.db.transaction(async (tx) => {
        const [user] = await this.usersRepository.create(
          {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
          },
          tx,
        );

        await this.repository.create({ userId: user.id, passwordHash }, tx);

        const { refreshToken } = await this.issueRefreshToken(
          { userId: user.id },
          tx,
        );

        return { user, refreshToken };
      });
    } catch (error) {
      throw isUniqueViolation({
        error,
        constraint: USERS_CONSTRAINTS.emailUnique,
      })
        ? new EmailTakenError({ email: data.email })
        : error;
    }
  };

  signIn = async ({ email, password }: AuthSignInInput) => {
    const user = await this.usersRepository.findByEmail({ email });

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const creds = await this.repository.findByUserId({ userId: user.id });

    if (!creds || !(await argon2.verify(creds.passwordHash, password))) {
      throw new InvalidCredentialsError();
    }

    return user;
  };

  me = async ({ userId }: AuthMeInput) => {
    const user = await this.usersRepository.findById({ id: userId });

    if (!user) {
      throw new AuthUserNotFoundError({ userId });
    }

    return user;
  };

  changePassword = async ({
    userId,
    currentPassword,
    newPassword,
  }: AuthChangePasswordInput) => {
    const creds = await this.repository.findByUserId({ userId });

    if (!creds || !(await argon2.verify(creds.passwordHash, currentPassword))) {
      throw new InvalidCurrentPasswordError();
    }

    const passwordHash = await argon2.hash(newPassword);

    return this.repository.updatePassword({ userId, passwordHash });
  };
}
