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
import { NOTES_ERROR_CODES } from "../notes.errors.js";

const createNote = async ({
  app,
  user,
  title = "Note",
  description,
}: {
  app: TestApp;
  user: TestUser;
  title?: string;
  description?: string;
}) => {
  const res = await requestAs({
    app,
    user,
    method: "POST",
    url: api("/notes"),
    payload: { title, description },
  });
  assert.equal(res.statusCode, HTTP_STATUS.created);
  return res.json<{ id: number; title: string; description: string | null }>();
};

describe("notes", () => {
  let app: TestApp;
  let owner: TestUser;
  let stranger: TestUser;

  before(async () => {
    app = await createTestApp();
    owner = await signUpUser({ app });
    stranger = await signUpUser({ app });
  });

  after(() => app.close());

  it("creates, lists, updates and deletes notes", async () => {
    const note = await createNote({ app, user: owner, title: "Todo" });
    assert.equal(note.description, null);

    const list = await requestAs({
      app,
      user: owner,
      method: "GET",
      url: api("/notes"),
    });
    assert.ok(list.json<{ id: number }[]>().some((row) => row.id === note.id));

    const update = await requestAs({
      app,
      user: owner,
      method: "PATCH",
      url: api(`/notes/${note.id}`),
      payload: { description: "details" },
    });
    assert.equal(update.statusCode, HTTP_STATUS.ok);
    assert.deepEqual(update.json(), {
      id: note.id,
      title: "Todo",
      description: "details",
    });

    const remove = await requestAs({
      app,
      user: owner,
      method: "DELETE",
      url: api(`/notes/${note.id}`),
    });
    assert.equal(remove.statusCode, HTTP_STATUS.noContent);

    const gone = await requestAs({
      app,
      user: owner,
      method: "GET",
      url: api(`/notes/${note.id}`),
    });
    assert.equal(gone.statusCode, HTTP_STATUS.notFound);
    assert.equal(gone.json().code, NOTES_ERROR_CODES.notFound);
  });

  it("hides other users' notes", async () => {
    const note = await createNote({ app, user: owner });

    const list = await requestAs({
      app,
      user: stranger,
      method: "GET",
      url: api("/notes"),
    });
    assert.equal(
      list.json<{ id: number }[]>().some((row) => row.id === note.id),
      false,
    );

    const get = await requestAs({
      app,
      user: stranger,
      method: "GET",
      url: api(`/notes/${note.id}`),
    });
    assert.equal(get.statusCode, HTTP_STATUS.notFound);
    assert.equal(get.json().code, NOTES_ERROR_CODES.notFound);
  });

  it("rejects an empty update", async () => {
    const note = await createNote({ app, user: owner });
    const res = await requestAs({
      app,
      user: owner,
      method: "PATCH",
      url: api(`/notes/${note.id}`),
      payload: {},
    });

    assert.equal(res.statusCode, HTTP_STATUS.badRequest);
    assert.equal(res.json().code, ERROR_CODES.validation);
  });
});
