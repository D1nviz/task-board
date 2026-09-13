import { createHash, randomBytes, randomUUIDv7 } from "node:crypto";
import argon2 from "argon2";
import type { Database, Transaction } from "@/core/db/types/index.js";
import type { UsersRepository } from "../users/users.repository.js";
import { AUTH_TOKENS_TTL } from "./auth.constants.js";
import type { AuthRepository } from "./auth.repository.js";
import type {
  AuthChangePasswordInput,
  AuthIssueRefreshTokenInput,
  AuthMeInput,
  AuthRevokeSessionInput,
  AuthRotateSessionInput,
  AuthRotateSessionResult,
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

  revokeSession = async ({ token }: AuthRevokeSessionInput) => {
    const stored = await this.repository.findRefreshToken({
      tokenHash: this.hashToken(token),
    });

    if (!stored) {
      return;
    }
    return this.repository.deleteFamily({ familyId: stored.familyId });
  };

  rotateSession = async ({
    token,
  }: AuthRotateSessionInput): Promise<AuthRotateSessionResult> => {
    const stored = await this.repository.findRefreshToken({
      tokenHash: this.hashToken(token),
    });

    if (!stored || stored.expiresAt < new Date()) {
      return { status: "invalid" };
    }

    if (stored.usedAt) {
      await this.repository.deleteFamily({ familyId: stored.familyId });

      return {
        status: "reuse",
        userId: stored.userId,
        familyId: stored.familyId,
      };
    }

    const user = await this.usersRepository.findById({ id: stored.userId });

    if (!user) {
      return { status: "invalid" };
    }

    return this.db.transaction(async (tx) => {
      await this.repository.markRefreshTokenUsed({ id: stored.id }, tx);

      const { refreshToken } = await this.issueRefreshToken(
        { userId: stored.userId, familyId: stored.familyId },
        tx,
      );

      return { status: "ok", user, refreshToken };
    });
  };

  signUp = async (data: AuthSignUpInput) => {
    const passwordHash = await argon2.hash(data.password);

    return this.db.transaction(async (tx) => {
      const [user] = await this.usersRepository.create(
        {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        tx,
      );

      await this.repository.create(
        {
          userId: user.id,
          passwordHash,
        },
        tx,
      );

      const { refreshToken } = await this.issueRefreshToken(
        { userId: user.id },
        tx,
      );

      return { user, refreshToken };
    });
  };

  signIn = async ({ email, password }: AuthSignInInput) => {
    const user = await this.usersRepository.findByEmail({ email });

    if (!user) {
      return null;
    }

    const creds = await this.repository.findByUserId({ userId: user.id });

    if (!creds || !(await argon2.verify(creds.passwordHash, password))) {
      return null;
    }

    return user;
  };

  me = ({ userId }: AuthMeInput) => {
    return this.usersRepository.findById({ id: userId });
  };

  changePassword = async ({
    userId,
    currentPassword,
    newPassword,
  }: AuthChangePasswordInput) => {
    const creds = await this.repository.findByUserId({ userId });

    if (!creds || !(await argon2.verify(creds.passwordHash, currentPassword))) {
      return null;
    }

    const passwordHash = await argon2.hash(newPassword);

    return this.repository.updatePassword({ userId, passwordHash });
  };
}
