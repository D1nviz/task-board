import { randomUUID } from "node:crypto";
import type { InjectOptions, LightMyRequestResponse } from "fastify";
import { buildApp } from "@/app.js";
import { API_PREFIX } from "@/core/constants/api.constants.js";
import { AUTH_TOKENS } from "@/modules/identity/auth/auth.constants.js";
import type { UserResponse } from "@/modules/identity/users/users.schema.js";
import { resolveTestDatabase } from "./database.js";

export const TEST_PASSWORD = "secret123";

export const api = (path: string) => `${API_PREFIX}${path}`;

type App = ReturnType<typeof buildApp>;

export const createTestApp = async ({
  configure,
}: {
  configure?: (app: App) => void;
} = {}) => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run tests");
  }

  process.env.DATABASE_URL = resolveTestDatabase({ databaseUrl }).testUrl;

  const app = buildApp({ logger: false });
  configure?.(app);
  await app.ready();
  return app;
};

export type TestApp = Awaited<ReturnType<typeof createTestApp>>;

export const cookieHeader = (res: LightMyRequestResponse) =>
  res.cookies
    .filter((cookie) => cookie.value !== "")
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

export const clearedCookies = (res: LightMyRequestResponse) =>
  res.cookies
    .filter((cookie) => cookie.value === "")
    .map((cookie) => cookie.name);

export const cookieValue = ({
  res,
  name,
}: {
  res: LightMyRequestResponse;
  name: string;
}) => res.cookies.find((cookie) => cookie.name === name)?.value;

export const uniqueEmail = () => `test_${randomUUID()}@test.local`;

export const signUpUser = async ({ app }: { app: TestApp }) => {
  const credentials = { email: uniqueEmail(), password: TEST_PASSWORD };
  const res = await app.inject({
    method: "POST",
    url: api("/auth/sign-up"),
    payload: { ...credentials, firstName: "Test", lastName: "User" },
  });

  if (res.statusCode !== 201) {
    throw new Error(`sign-up failed: ${res.statusCode} ${res.body}`);
  }

  return {
    user: res.json<UserResponse>(),
    credentials,
    cookies: cookieHeader(res),
    refreshToken: cookieValue({ res, name: AUTH_TOKENS.refreshToken }),
    accessToken: cookieValue({ res, name: AUTH_TOKENS.accessToken }),
  };
};

export type TestUser = Awaited<ReturnType<typeof signUpUser>>;

export const requestAs = ({
  app,
  user,
  ...options
}: { app: TestApp; user: TestUser } & InjectOptions) =>
  app.inject({
    ...options,
    headers: { ...options.headers, cookie: user.cookies },
  });
