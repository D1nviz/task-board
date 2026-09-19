import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { api, createTestApp, type TestApp } from "@/core/testing/test-app.js";
import { DEPENDENCY_STATUSES, HEALTH_STATUSES } from "../health.schema.js";
import { HealthService } from "../health.service.js";

describe("health", () => {
  let app: TestApp;

  before(async () => {
    app = await createTestApp();
  });

  after(() => app.close());

  it("reports ok when the database answers", async () => {
    const res = await app.inject({ method: "GET", url: api("/health") });

    assert.equal(res.statusCode, HTTP_STATUS.ok);
    assert.deepEqual(res.json(), {
      status: HEALTH_STATUSES.ok,
      database: DEPENDENCY_STATUSES.up,
    });
  });

  it("reports degraded when the database query fails", async () => {
    const brokenDb = {
      execute: async () => {
        throw new Error("connection refused");
      },
    } as unknown as TestApp["db"];
    const service = new HealthService(brokenDb);

    assert.deepEqual(await service.check(), {
      status: HEALTH_STATUSES.degraded,
      database: DEPENDENCY_STATUSES.down,
    });
  });
});
