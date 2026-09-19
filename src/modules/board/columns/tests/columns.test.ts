import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import {
  api,
  createTestApp,
  requestAs,
  signUpUser,
  type TestApp,
  type TestUser,
} from "@/core/testing/test-app.js";
import { BOARDS_ERROR_CODES } from "../../boards/boards.errors.js";
import { COLUMNS_ERROR_CODES } from "../columns.errors.js";

const createBoard = async ({ app, user }: { app: TestApp; user: TestUser }) => {
  const res = await requestAs({
    app,
    user,
    method: "POST",
    url: api("/boards"),
    payload: { title: "Board" },
  });
  return res.json<{ id: number }>();
};

const createColumn = ({
  app,
  user,
  boardId,
  title = "Column",
  sortOrder,
}: {
  app: TestApp;
  user: TestUser;
  boardId: number;
  title?: string;
  sortOrder?: number;
}) =>
  requestAs({
    app,
    user,
    method: "POST",
    url: api("/columns"),
    payload: { title, boardId, sortOrder },
  });

describe("columns", () => {
  let app: TestApp;
  let owner: TestUser;
  let stranger: TestUser;
  let boardId: number;

  before(async () => {
    app = await createTestApp();
    owner = await signUpUser({ app });
    stranger = await signUpUser({ app });
    boardId = (await createBoard({ app, user: owner })).id;
  });

  after(() => app.close());

  it("assigns the next sort order and lists columns in order", async () => {
    const board = await createBoard({ app, user: owner });
    const first = await createColumn({
      app,
      user: owner,
      boardId: board.id,
      title: "First",
    });
    const second = await createColumn({
      app,
      user: owner,
      boardId: board.id,
      title: "Second",
    });
    const explicit = await createColumn({
      app,
      user: owner,
      boardId: board.id,
      title: "Zero",
      sortOrder: 0,
    });

    assert.equal(first.statusCode, HTTP_STATUS.created);
    assert.equal(first.json().sortOrder, 0);
    assert.equal(second.json().sortOrder, 1);
    assert.equal(explicit.json().sortOrder, 0);

    const list = await requestAs({
      app,
      user: owner,
      method: "GET",
      url: api(`/columns/by-board/${board.id}`),
    });
    assert.equal(list.statusCode, HTTP_STATUS.ok);
    assert.deepEqual(
      list.json<{ title: string }[]>().map((column) => column.title),
      ["First", "Zero", "Second"],
    );
  });

  it("updates and deletes an owned column", async () => {
    const column = (await createColumn({ app, user: owner, boardId })).json();

    const update = await requestAs({
      app,
      user: owner,
      method: "PATCH",
      url: api(`/columns/${column.id}`),
      payload: { title: "Renamed", sortOrder: 5 },
    });
    assert.equal(update.statusCode, HTTP_STATUS.ok);
    assert.equal(update.json().title, "Renamed");
    assert.equal(update.json().sortOrder, 5);

    const remove = await requestAs({
      app,
      user: owner,
      method: "DELETE",
      url: api(`/columns/${column.id}`),
    });
    assert.equal(remove.statusCode, HTTP_STATUS.noContent);

    const gone = await requestAs({
      app,
      user: owner,
      method: "GET",
      url: api(`/columns/${column.id}`),
    });
    assert.equal(gone.statusCode, HTTP_STATUS.notFound);
    assert.equal(gone.json().code, COLUMNS_ERROR_CODES.notFound);
  });

  it("refuses to create or list columns on another user's board", async () => {
    const create = await createColumn({ app, user: stranger, boardId });
    assert.equal(create.statusCode, HTTP_STATUS.notFound);
    assert.equal(create.json().code, BOARDS_ERROR_CODES.notFound);

    const list = await requestAs({
      app,
      user: stranger,
      method: "GET",
      url: api(`/columns/by-board/${boardId}`),
    });
    assert.equal(list.statusCode, HTTP_STATUS.notFound);
    assert.equal(list.json().code, BOARDS_ERROR_CODES.notFound);
  });

  it("hides another user's column behind COLUMN_NOT_FOUND", async () => {
    const column = (await createColumn({ app, user: owner, boardId })).json();

    const get = await requestAs({
      app,
      user: stranger,
      method: "GET",
      url: api(`/columns/${column.id}`),
    });
    const update = await requestAs({
      app,
      user: stranger,
      method: "PATCH",
      url: api(`/columns/${column.id}`),
      payload: { title: "Hijack" },
    });
    const remove = await requestAs({
      app,
      user: stranger,
      method: "DELETE",
      url: api(`/columns/${column.id}`),
    });

    for (const res of [get, update, remove]) {
      assert.equal(res.statusCode, HTTP_STATUS.notFound);
      assert.equal(res.json().code, COLUMNS_ERROR_CODES.notFound);
    }
  });
});
