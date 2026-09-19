import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { eq } from "drizzle-orm";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { ERROR_CODES } from "@/core/errors/index.js";
import {
  api,
  clearedCookies,
  cookieValue,
  createTestApp,
  requestAs,
  signUpUser,
  TEST_PASSWORD,
  type TestApp,
  uniqueEmail,
} from "@/core/testing/test-app.js";
import { UsersRepository } from "../../users/users.repository.js";
import { users } from "../../users/users.table.js";
import { AUTH_TOKENS } from "../auth.constants.js";
import { AUTH_ERROR_CODES } from "../auth.errors.js";
import { AuthRepository } from "../auth.repository.js";
import { AuthService } from "../auth.service.js";
import { refreshTokens } from "../auth.table.js";

const signIn = ({
  app,
  email,
  password,
}: {
  app: TestApp;
  email: string;
  password: string;
}) =>
  app.inject({
    method: "POST",
    url: api("/auth/sign-in"),
    payload: { email, password },
  });

const refresh = ({ app, token }: { app: TestApp; token?: string }) =>
  app.inject({
    method: "POST",
    url: api("/auth/refresh"),
    headers: token ? { cookie: `${AUTH_TOKENS.refreshToken}=${token}` } : {},
  });

describe("auth", () => {
  let app: TestApp;

  before(async () => {
    app = await createTestApp();
  });

  after(() => app.close());

  describe("sign-up", () => {
    it("creates the user, sets both cookies and hides internal columns", async () => {
      const email = uniqueEmail();
      const res = await app.inject({
        method: "POST",
        url: api("/auth/sign-up"),
        payload: {
          email,
          password: TEST_PASSWORD,
          firstName: "A",
          lastName: "B",
        },
      });

      assert.equal(res.statusCode, HTTP_STATUS.created);
      const body = res.json();
      assert.equal(body.email, email);
      assert.equal(body.role, "user");
      assert.equal("createdAt" in body, false);
      assert.ok(cookieValue({ res, name: AUTH_TOKENS.accessToken }));
      assert.ok(cookieValue({ res, name: AUTH_TOKENS.refreshToken }));
    });

    it("rejects a duplicate email with AUTH_EMAIL_TAKEN", async () => {
      const { credentials } = await signUpUser({ app });
      const res = await app.inject({
        method: "POST",
        url: api("/auth/sign-up"),
        payload: { ...credentials, firstName: "A", lastName: "B" },
      });

      assert.equal(res.statusCode, HTTP_STATUS.conflict);
      assert.equal(res.json().code, AUTH_ERROR_CODES.emailTaken);
    });

    it("rejects an invalid body", async () => {
      const res = await app.inject({
        method: "POST",
        url: api("/auth/sign-up"),
        payload: { email: uniqueEmail(), password: "short" },
      });

      assert.equal(res.statusCode, HTTP_STATUS.badRequest);
      assert.equal(res.json().code, ERROR_CODES.validation);
    });
  });

  describe("sign-in", () => {
    it("signs in with valid credentials", async () => {
      const { credentials, user } = await signUpUser({ app });
      const res = await signIn({ app, ...credentials });

      assert.equal(res.statusCode, HTTP_STATUS.ok);
      assert.equal(res.json().id, user.id);
      assert.ok(cookieValue({ res, name: AUTH_TOKENS.refreshToken }));
    });

    it("rejects a wrong password and an unknown email the same way", async () => {
      const { credentials } = await signUpUser({ app });
      const wrongPassword = await signIn({
        app,
        email: credentials.email,
        password: "wrong123",
      });
      const unknownEmail = await signIn({
        app,
        email: uniqueEmail(),
        password: TEST_PASSWORD,
      });

      for (const res of [wrongPassword, unknownEmail]) {
        assert.equal(res.statusCode, HTTP_STATUS.unauthorized);
        assert.equal(res.json().code, AUTH_ERROR_CODES.invalidCredentials);
      }
    });
  });

  describe("me", () => {
    it("returns the current user", async () => {
      const user = await signUpUser({ app });
      const res = await requestAs({
        app,
        user,
        method: "GET",
        url: api("/auth/me"),
      });

      assert.equal(res.statusCode, HTTP_STATUS.ok);
      assert.equal(res.json().email, user.credentials.email);
    });

    it("requires a cookie", async () => {
      const res = await app.inject({ method: "GET", url: api("/auth/me") });

      assert.equal(res.statusCode, HTTP_STATUS.unauthorized);
    });

    it("clears cookies with AUTH_USER_NOT_FOUND when the user was deleted", async () => {
      const user = await signUpUser({ app });
      await app.db.delete(users).where(eq(users.id, user.user.id));

      const res = await requestAs({
        app,
        user,
        method: "GET",
        url: api("/auth/me"),
      });

      assert.equal(res.statusCode, HTTP_STATUS.unauthorized);
      assert.equal(res.json().code, AUTH_ERROR_CODES.userNotFound);
      assert.deepEqual(clearedCookies(res).sort(), [
        AUTH_TOKENS.accessToken,
        AUTH_TOKENS.refreshToken,
      ]);
    });
  });

  describe("refresh", () => {
    it("rotates the refresh token", async () => {
      const { refreshToken } = await signUpUser({ app });
      const res = await refresh({ app, token: refreshToken });

      assert.equal(res.statusCode, HTTP_STATUS.noContent);
      const rotated = cookieValue({ res, name: AUTH_TOKENS.refreshToken });
      assert.ok(rotated);
      assert.notEqual(rotated, refreshToken);
      assert.ok(cookieValue({ res, name: AUTH_TOKENS.accessToken }));
    });

    it("detects reuse, revokes the whole family and leaks no identifiers", async () => {
      const { refreshToken } = await signUpUser({ app });
      const first = await refresh({ app, token: refreshToken });
      const rotated = cookieValue({
        res: first,
        name: AUTH_TOKENS.refreshToken,
      });

      const reuse = await refresh({ app, token: refreshToken });
      assert.equal(reuse.statusCode, HTTP_STATUS.unauthorized);
      assert.equal(reuse.json().code, AUTH_ERROR_CODES.refreshTokenReuse);
      assert.equal("details" in reuse.json(), false);
      assert.deepEqual(clearedCookies(reuse).sort(), [
        AUTH_TOKENS.accessToken,
        AUTH_TOKENS.refreshToken,
      ]);

      const revoked = await refresh({ app, token: rotated });
      assert.equal(revoked.statusCode, HTTP_STATUS.unauthorized);
      assert.equal(revoked.json().code, AUTH_ERROR_CODES.invalidRefreshToken);
    });

    it("rejects a missing or unknown token", async () => {
      const missing = await refresh({ app });
      assert.equal(missing.statusCode, HTTP_STATUS.unauthorized);
      assert.equal(missing.json().code, AUTH_ERROR_CODES.noRefreshToken);

      const unknown = await refresh({ app, token: "bogus" });
      assert.equal(unknown.statusCode, HTTP_STATUS.unauthorized);
      assert.equal(unknown.json().code, AUTH_ERROR_CODES.invalidRefreshToken);
    });

    it("rejects an expired token", async () => {
      const { refreshToken, user } = await signUpUser({ app });
      await app.db
        .update(refreshTokens)
        .set({ expiresAt: new Date(Date.now() - 1000) })
        .where(eq(refreshTokens.userId, user.id));

      const res = await refresh({ app, token: refreshToken });

      assert.equal(res.statusCode, HTTP_STATUS.unauthorized);
      assert.equal(res.json().code, AUTH_ERROR_CODES.invalidRefreshToken);
    });
  });

  describe("logout", () => {
    it("clears cookies and revokes the refresh token", async () => {
      const user = await signUpUser({ app });
      const res = await requestAs({
        app,
        user,
        method: "POST",
        url: api("/auth/logout"),
      });

      assert.equal(res.statusCode, HTTP_STATUS.noContent);
      assert.deepEqual(clearedCookies(res).sort(), [
        AUTH_TOKENS.accessToken,
        AUTH_TOKENS.refreshToken,
      ]);

      const reused = await refresh({ app, token: user.refreshToken });
      assert.equal(reused.statusCode, HTTP_STATUS.unauthorized);
    });
  });

  describe("change-password", () => {
    it("rejects a wrong current password", async () => {
      const user = await signUpUser({ app });
      const res = await requestAs({
        app,
        user,
        method: "POST",
        url: api("/auth/change-password"),
        payload: { currentPassword: "wrong123", newPassword: "another123" },
      });

      assert.equal(res.statusCode, HTTP_STATUS.unauthorized);
      assert.equal(res.json().code, AUTH_ERROR_CODES.invalidCurrentPassword);
    });

    it("changes the password", async () => {
      const user = await signUpUser({ app });
      const newPassword = "another123";
      const res = await requestAs({
        app,
        user,
        method: "POST",
        url: api("/auth/change-password"),
        payload: { currentPassword: TEST_PASSWORD, newPassword },
      });
      assert.equal(res.statusCode, HTTP_STATUS.noContent);

      const oldSignIn = await signIn({ app, ...user.credentials });
      assert.equal(oldSignIn.statusCode, HTTP_STATUS.unauthorized);

      const newSignIn = await signIn({
        app,
        email: user.credentials.email,
        password: newPassword,
      });
      assert.equal(newSignIn.statusCode, HTTP_STATUS.ok);
    });
  });

  describe("expired session purge", () => {
    it("removes expired refresh tokens and keeps live ones", async () => {
      const { user } = await signUpUser({ app });
      const repository = new AuthRepository(app.db);
      const service = new AuthService(
        repository,
        new UsersRepository(app.db),
        app.db,
      );

      await repository.createRefreshToken({
        tokenHash: `expired-${user.id}`,
        familyId: crypto.randomUUID(),
        userId: user.id,
        expiresAt: new Date(Date.now() - 1000),
      });

      const purged = await service.purgeExpiredSessions();
      assert.ok(purged >= 1);

      const remaining = await app.db.query.refreshTokens.findMany({
        where: eq(refreshTokens.userId, user.id),
      });
      assert.equal(remaining.length, 1);
      assert.ok(remaining[0].expiresAt > new Date());
    });
  });
});
