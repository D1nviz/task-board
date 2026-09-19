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
import { COLUMNS_ERROR_CODES } from "../../columns/columns.errors.js";
import { LABELS_ERROR_CODES } from "../../labels/labels.errors.js";
import { TASKS_ERROR_CODES } from "../tasks.errors.js";

type Ctx = { app: TestApp; user: TestUser };

const createBoard = async ({ app, user }: Ctx) => {
  const res = await requestAs({
    app,
    user,
    method: "POST",
    url: api("/boards"),
    payload: { title: "Board" },
  });
  return res.json<{ id: number }>();
};

const createColumn = async ({
  app,
  user,
  boardId,
}: Ctx & { boardId: number }) => {
  const res = await requestAs({
    app,
    user,
    method: "POST",
    url: api("/columns"),
    payload: { title: "Column", boardId },
  });
  return res.json<{ id: number }>();
};

const createLabel = async ({
  app,
  user,
  boardId,
  name = "label",
}: Ctx & { boardId: number; name?: string }) => {
  const res = await requestAs({
    app,
    user,
    method: "POST",
    url: api("/labels"),
    payload: { name, boardId },
  });
  return res.json<{ id: number; name: string }>();
};

const createTask = ({
  app,
  user,
  boardId,
  boardColumnId,
}: Ctx & { boardId: number; boardColumnId?: number }) =>
  requestAs({
    app,
    user,
    method: "POST",
    url: api("/tasks"),
    payload: { title: "Task", boardId, boardColumnId },
  });

const attach = ({
  app,
  user,
  taskId,
  labelId,
}: Ctx & { taskId: number; labelId: number }) =>
  requestAs({
    app,
    user,
    method: "PUT",
    url: api(`/tasks/${taskId}/labels/${labelId}`),
  });

const detach = ({
  app,
  user,
  taskId,
  labelId,
}: Ctx & { taskId: number; labelId: number }) =>
  requestAs({
    app,
    user,
    method: "DELETE",
    url: api(`/tasks/${taskId}/labels/${labelId}`),
  });

describe("tasks", () => {
  let app: TestApp;
  let owner: TestUser;
  let stranger: TestUser;
  let boardId: number;
  let columnId: number;
  let otherBoardId: number;
  let otherBoardColumnId: number;
  let strangerBoardId: number;
  let strangerColumnId: number;

  before(async () => {
    app = await createTestApp();
    owner = await signUpUser({ app });
    stranger = await signUpUser({ app });

    boardId = (await createBoard({ app, user: owner })).id;
    columnId = (await createColumn({ app, user: owner, boardId })).id;
    otherBoardId = (await createBoard({ app, user: owner })).id;
    otherBoardColumnId = (
      await createColumn({ app, user: owner, boardId: otherBoardId })
    ).id;
    strangerBoardId = (await createBoard({ app, user: stranger })).id;
    strangerColumnId = (
      await createColumn({ app, user: stranger, boardId: strangerBoardId })
    ).id;
  });

  after(() => app.close());

  describe("create", () => {
    it("creates a task in a column of the same board", async () => {
      const res = await createTask({
        app,
        user: owner,
        boardId,
        boardColumnId: columnId,
      });

      assert.equal(res.statusCode, HTTP_STATUS.created);
      assert.equal(res.json().boardColumnId, columnId);
      assert.equal(res.json().priority, "medium");
    });

    it("rejects a column that belongs to another board, own or foreign", async () => {
      const ownOther = await createTask({
        app,
        user: owner,
        boardId,
        boardColumnId: otherBoardColumnId,
      });
      const foreign = await createTask({
        app,
        user: owner,
        boardId,
        boardColumnId: strangerColumnId,
      });

      for (const res of [ownOther, foreign]) {
        assert.equal(res.statusCode, HTTP_STATUS.notFound);
        assert.equal(res.json().code, COLUMNS_ERROR_CODES.notFound);
      }
    });

    it("rejects another user's board", async () => {
      const res = await createTask({
        app,
        user: owner,
        boardId: strangerBoardId,
      });

      assert.equal(res.statusCode, HTTP_STATUS.notFound);
      assert.equal(res.json().code, BOARDS_ERROR_CODES.notFound);
    });
  });

  describe("read", () => {
    it("returns details with labels and column", async () => {
      const task = (
        await createTask({ app, user: owner, boardId, boardColumnId: columnId })
      ).json();
      const res = await requestAs({
        app,
        user: owner,
        method: "GET",
        url: api(`/tasks/${task.id}`),
      });

      assert.equal(res.statusCode, HTTP_STATUS.ok);
      const body = res.json();
      assert.deepEqual(body.labels, []);
      assert.equal(body.boardColumn.id, columnId);
      assert.equal(body.board.id, boardId);
    });

    it("lists by board and by column, and hides foreign ones", async () => {
      const task = (
        await createTask({ app, user: owner, boardId, boardColumnId: columnId })
      ).json();

      const byBoard = await requestAs({
        app,
        user: owner,
        method: "GET",
        url: api(`/tasks/by-board/${boardId}`),
      });
      assert.ok(
        byBoard.json<{ id: number }[]>().some((row) => row.id === task.id),
      );

      const byColumn = await requestAs({
        app,
        user: owner,
        method: "GET",
        url: api(`/tasks/by-column/${columnId}`),
      });
      assert.ok(
        byColumn.json<{ id: number }[]>().some((row) => row.id === task.id),
      );

      const foreignBoard = await requestAs({
        app,
        user: stranger,
        method: "GET",
        url: api(`/tasks/by-board/${boardId}`),
      });
      assert.equal(foreignBoard.statusCode, HTTP_STATUS.notFound);
      assert.equal(foreignBoard.json().code, BOARDS_ERROR_CODES.notFound);

      const foreignColumn = await requestAs({
        app,
        user: stranger,
        method: "GET",
        url: api(`/tasks/by-column/${columnId}`),
      });
      assert.equal(foreignColumn.statusCode, HTTP_STATUS.notFound);
      assert.equal(foreignColumn.json().code, COLUMNS_ERROR_CODES.notFound);

      const foreignTask = await requestAs({
        app,
        user: stranger,
        method: "GET",
        url: api(`/tasks/${task.id}`),
      });
      assert.equal(foreignTask.statusCode, HTTP_STATUS.notFound);
      assert.equal(foreignTask.json().code, TASKS_ERROR_CODES.notFound);
    });
  });

  describe("update and delete", () => {
    it("moves a task only within its board", async () => {
      const task = (await createTask({ app, user: owner, boardId })).json();

      const wrongBoard = await requestAs({
        app,
        user: owner,
        method: "PATCH",
        url: api(`/tasks/${task.id}`),
        payload: { boardColumnId: otherBoardColumnId },
      });
      assert.equal(wrongBoard.statusCode, HTTP_STATUS.notFound);
      assert.equal(wrongBoard.json().code, COLUMNS_ERROR_CODES.notFound);

      const ok = await requestAs({
        app,
        user: owner,
        method: "PATCH",
        url: api(`/tasks/${task.id}`),
        payload: { boardColumnId: columnId, priority: "high" },
      });
      assert.equal(ok.statusCode, HTTP_STATUS.ok);
      assert.equal(ok.json().boardColumnId, columnId);
      assert.equal(ok.json().priority, "high");
    });

    it("deletes an owned task and refuses a foreign one", async () => {
      const task = (await createTask({ app, user: owner, boardId })).json();

      const foreign = await requestAs({
        app,
        user: stranger,
        method: "DELETE",
        url: api(`/tasks/${task.id}`),
      });
      assert.equal(foreign.statusCode, HTTP_STATUS.notFound);
      assert.equal(foreign.json().code, TASKS_ERROR_CODES.notFound);

      const own = await requestAs({
        app,
        user: owner,
        method: "DELETE",
        url: api(`/tasks/${task.id}`),
      });
      assert.equal(own.statusCode, HTTP_STATUS.noContent);

      const gone = await requestAs({
        app,
        user: owner,
        method: "GET",
        url: api(`/tasks/${task.id}`),
      });
      assert.equal(gone.statusCode, HTTP_STATUS.notFound);
    });
  });

  describe("labels", () => {
    it("attaches and detaches labels of the same board idempotently", async () => {
      const task = (await createTask({ app, user: owner, boardId })).json();
      const label = await createLabel({
        app,
        user: owner,
        boardId,
        name: `l-${task.id}`,
      });

      assert.equal(
        (await attach({ app, user: owner, taskId: task.id, labelId: label.id }))
          .statusCode,
        HTTP_STATUS.noContent,
      );
      assert.equal(
        (await attach({ app, user: owner, taskId: task.id, labelId: label.id }))
          .statusCode,
        HTTP_STATUS.noContent,
      );

      const withLabel = await requestAs({
        app,
        user: owner,
        method: "GET",
        url: api(`/tasks/${task.id}`),
      });
      assert.deepEqual(withLabel.json().labels, [
        { id: label.id, name: label.name },
      ]);

      assert.equal(
        (await detach({ app, user: owner, taskId: task.id, labelId: label.id }))
          .statusCode,
        HTTP_STATUS.noContent,
      );
      assert.equal(
        (await detach({ app, user: owner, taskId: task.id, labelId: label.id }))
          .statusCode,
        HTTP_STATUS.noContent,
      );

      const without = await requestAs({
        app,
        user: owner,
        method: "GET",
        url: api(`/tasks/${task.id}`),
      });
      assert.deepEqual(without.json().labels, []);
    });

    it("rejects labels from another board and missing labels", async () => {
      const task = (await createTask({ app, user: owner, boardId })).json();
      const otherBoardLabel = await createLabel({
        app,
        user: owner,
        boardId: otherBoardId,
        name: `o-${task.id}`,
      });
      const strangerLabel = await createLabel({
        app,
        user: stranger,
        boardId: strangerBoardId,
        name: `s-${task.id}`,
      });

      for (const labelId of [otherBoardLabel.id, strangerLabel.id, 999_999]) {
        const res = await attach({
          app,
          user: owner,
          taskId: task.id,
          labelId,
        });
        assert.equal(res.statusCode, HTTP_STATUS.notFound);
        assert.equal(res.json().code, LABELS_ERROR_CODES.notFound);
      }
    });

    it("refuses to touch labels of a foreign task", async () => {
      const task = (await createTask({ app, user: owner, boardId })).json();
      const label = await createLabel({
        app,
        user: owner,
        boardId,
        name: `f-${task.id}`,
      });

      const attachRes = await attach({
        app,
        user: stranger,
        taskId: task.id,
        labelId: label.id,
      });
      const detachRes = await detach({
        app,
        user: stranger,
        taskId: task.id,
        labelId: label.id,
      });

      for (const res of [attachRes, detachRes]) {
        assert.equal(res.statusCode, HTTP_STATUS.notFound);
        assert.equal(res.json().code, TASKS_ERROR_CODES.notFound);
      }
    });
  });
});
