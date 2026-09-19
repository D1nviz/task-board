import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { ERROR_CODES } from "@/core/errors/index.js";
import {
  api,
  createTestApp,
  requestAs,
  signUpUser,
  type TestApp,
  type TestUser,
} from "@/core/testing/test-app.js";
import { BOARDS_ERROR_CODES } from "../boards.errors.js";

const createBoard = async ({
  app,
  user,
  title = "Board",
}: {
  app: TestApp;
  user: TestUser;
  title?: string;
}) => {
  const res = await requestAs({
    app,
    user,
    method: "POST",
    url: api("/boards"),
    payload: { title },
  });
  assert.equal(res.statusCode, HTTP_STATUS.created);
  return res.json<{ id: number; title: string }>();
};

describe("boards", () => {
  let app: TestApp;
  let owner: TestUser;
  let stranger: TestUser;

  before(async () => {
    app = await createTestApp();
    owner = await signUpUser({ app });
    stranger = await signUpUser({ app });
  });

  after(() => app.close());

  it("creates and lists boards of the current user only", async () => {
    const board = await createBoard({ app, user: owner, title: "Mine" });
    await createBoard({ app, user: stranger, title: "Theirs" });

    const res = await requestAs({
      app,
      user: owner,
      method: "GET",
      url: api("/boards"),
    });

    assert.equal(res.statusCode, HTTP_STATUS.ok);
    const ids = res.json<{ id: number }[]>().map((row) => row.id);
    assert.ok(ids.includes(board.id));
    assert.equal(
      res.json().every((row: { title: string }) => row.title !== "Theirs"),
      true,
    );
  });

  it("gets, updates and deletes an owned board", async () => {
    const board = await createBoard({ app, user: owner });

    const get = await requestAs({
      app,
      user: owner,
      method: "GET",
      url: api(`/boards/${board.id}`),
    });
    assert.equal(get.statusCode, HTTP_STATUS.ok);
    assert.deepEqual(get.json(), board);

    const update = await requestAs({
      app,
      user: owner,
      method: "PATCH",
      url: api(`/boards/${board.id}`),
      payload: { title: "Renamed" },
    });
    assert.equal(update.statusCode, HTTP_STATUS.ok);
    assert.equal(update.json().title, "Renamed");

    const remove = await requestAs({
      app,
      user: owner,
      method: "DELETE",
      url: api(`/boards/${board.id}`),
    });
    assert.equal(remove.statusCode, HTTP_STATUS.noContent);

    const gone = await requestAs({
      app,
      user: owner,
      method: "GET",
      url: api(`/boards/${board.id}`),
    });
    assert.equal(gone.statusCode, HTTP_STATUS.notFound);
    assert.equal(gone.json().code, BOARDS_ERROR_CODES.notFound);
  });

  it("hides other users' boards behind BOARD_NOT_FOUND", async () => {
    const board = await createBoard({ app, user: owner });

    for (const method of ["GET", "DELETE"] as const) {
      const res = await requestAs({
        app,
        user: stranger,
        method,
        url: api(`/boards/${board.id}`),
      });
      assert.equal(res.statusCode, HTTP_STATUS.notFound);
      assert.equal(res.json().code, BOARDS_ERROR_CODES.notFound);
    }

    const update = await requestAs({
      app,
      user: stranger,
      method: "PATCH",
      url: api(`/boards/${board.id}`),
      payload: { title: "Hijack" },
    });
    assert.equal(update.statusCode, HTTP_STATUS.notFound);
  });

  it("validates params and body", async () => {
    const badId = await requestAs({
      app,
      user: owner,
      method: "GET",
      url: api("/boards/abc"),
    });
    assert.equal(badId.statusCode, HTTP_STATUS.badRequest);
    assert.equal(badId.json().code, ERROR_CODES.validation);

    const emptyTitle = await requestAs({
      app,
      user: owner,
      method: "POST",
      url: api("/boards"),
      payload: { title: "" },
    });
    assert.equal(emptyTitle.statusCode, HTTP_STATUS.badRequest);
  });
});
