import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { api, createTestApp, type TestApp } from "@/core/testing/test-app.js";

describe("health", () => {
  let app: TestApp;

  before(async () => {
    app = await createTestApp();
  });

  after(() => app.close());

  it("responds ok without authentication", async () => {
    const res = await app.inject({ method: "GET", url: api("/health") });

    assert.equal(res.statusCode, HTTP_STATUS.ok);
    assert.deepEqual(res.json(), { status: "ok" });
  });
});
