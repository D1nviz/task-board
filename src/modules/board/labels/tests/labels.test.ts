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
import { LABELS_ERROR_CODES } from "../labels.errors.js";

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

const createLabel = ({
  app,
  user,
  boardId,
  name,
}: {
  app: TestApp;
  user: TestUser;
  boardId: number;
  name: string;
}) =>
  requestAs({
    app,
    user,
    method: "POST",
    url: api("/labels"),
    payload: { name, boardId },
  });

describe("labels", () => {
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

  it("creates, lists, renames and deletes labels", async () => {
    const created = await createLabel({
      app,
      user: owner,
      boardId,
      name: "bug",
    });
    assert.equal(created.statusCode, HTTP_STATUS.created);
    const label = created.json();

    const list = await requestAs({
      app,
      user: owner,
      method: "GET",
      url: api(`/labels/by-board/${boardId}`),
    });
    assert.ok(list.json<{ id: number }[]>().some((row) => row.id === label.id));

    const rename = await requestAs({
      app,
      user: owner,
      method: "PATCH",
      url: api(`/labels/${label.id}`),
      payload: { name: "defect" },
    });
    assert.equal(rename.statusCode, HTTP_STATUS.ok);
    assert.equal(rename.json().name, "defect");

    const remove = await requestAs({
      app,
      user: owner,
      method: "DELETE",
      url: api(`/labels/${label.id}`),
    });
    assert.equal(remove.statusCode, HTTP_STATUS.noContent);

    const gone = await requestAs({
      app,
      user: owner,
      method: "GET",
      url: api(`/labels/${label.id}`),
    });
    assert.equal(gone.statusCode, HTTP_STATUS.notFound);
    assert.equal(gone.json().code, LABELS_ERROR_CODES.notFound);
  });

  it("keeps names unique per board but allows the same name on another board", async () => {
    const otherBoard = await createBoard({ app, user: owner });
    await createLabel({ app, user: owner, boardId, name: "urgent" });

    const duplicate = await createLabel({
      app,
      user: owner,
      boardId,
      name: "urgent",
    });
    assert.equal(duplicate.statusCode, HTTP_STATUS.conflict);
    assert.equal(duplicate.json().code, LABELS_ERROR_CODES.nameTaken);

    const elsewhere = await createLabel({
      app,
      user: owner,
      boardId: otherBoard.id,
      name: "urgent",
    });
    assert.equal(elsewhere.statusCode, HTTP_STATUS.created);
  });

  it("rejects renaming to a name already used on the board", async () => {
    await createLabel({ app, user: owner, boardId, name: "taken" });
    const other = (
      await createLabel({ app, user: owner, boardId, name: "free" })
    ).json();

    const rename = await requestAs({
      app,
      user: owner,
      method: "PATCH",
      url: api(`/labels/${other.id}`),
      payload: { name: "taken" },
    });

    assert.equal(rename.statusCode, HTTP_STATUS.conflict);
    assert.equal(rename.json().code, LABELS_ERROR_CODES.nameTaken);
  });

  it("refuses labels on another user's board and hides existing ones", async () => {
    const create = await createLabel({
      app,
      user: stranger,
      boardId,
      name: "intruder",
    });
    assert.equal(create.statusCode, HTTP_STATUS.notFound);
    assert.equal(create.json().code, BOARDS_ERROR_CODES.notFound);

    const label = (
      await createLabel({ app, user: owner, boardId, name: "private" })
    ).json();
    const get = await requestAs({
      app,
      user: stranger,
      method: "GET",
      url: api(`/labels/${label.id}`),
    });
    assert.equal(get.statusCode, HTTP_STATUS.notFound);
    assert.equal(get.json().code, LABELS_ERROR_CODES.notFound);
  });
});
