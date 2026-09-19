import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { ERROR_CODES } from "@/core/errors/index.js";
import { api, createTestApp, type TestApp } from "@/core/testing/test-app.js";

const SECRET_MESSAGE = "internal secret";
const CRASH_URL = "/test-crash";

describe("error handler", () => {
  let app: TestApp;

  before(async () => {
    app = await createTestApp({
      configure: (instance) => {
        instance.get(CRASH_URL, async () => {
          throw new Error(SECRET_MESSAGE);
        });
      },
    });
  });

  after(() => app.close());

  it("returns ROUTE_NOT_FOUND for unknown routes", async () => {
    const res = await app.inject({ method: "GET", url: "/nowhere" });

    assert.equal(res.statusCode, HTTP_STATUS.notFound);
    assert.equal(res.json().code, ERROR_CODES.routeNotFound);
  });

  it("maps schema validation failures to 400 with details", async () => {
    const res = await app.inject({
      method: "POST",
      url: api("/auth/sign-in"),
      payload: { email: "someone@test.local" },
    });

    assert.equal(res.statusCode, HTTP_STATUS.badRequest);
    const body = res.json();
    assert.equal(body.code, ERROR_CODES.validation);
    assert.ok(Array.isArray(body.details));
  });

  it("passes through Fastify errors with their status and code", async () => {
    const res = await app.inject({ method: "GET", url: api("/boards") });

    assert.equal(res.statusCode, HTTP_STATUS.unauthorized);
    assert.match(res.json().code, /^FST_JWT_/);
  });

  it("hides internals behind a generic 500", async () => {
    const res = await app.inject({ method: "GET", url: CRASH_URL });

    assert.equal(res.statusCode, HTTP_STATUS.internalServerError);
    assert.equal(res.json().code, ERROR_CODES.internal);
    assert.equal(res.body.includes(SECRET_MESSAGE), false);
  });
});
