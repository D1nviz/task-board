import { Type } from "typebox";
import type { WithActor } from "@/core/types/actor.js";

export const TaskByBoardIdParamsSchema = Type.Object({
  boardId: Type.Integer({ minimum: 1 }),
});

export const TaskByColumnIdParamsSchema = Type.Object({
  columnId: Type.Integer({ minimum: 1 }),
});

export const TaskUpdateBodySchema = Type.Object(
  {
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 256 })),
    description: Type.Optional(Type.String({ maxLength: 5000 })),
    priority: Type.Optional(Type.Enum(["low", "medium", "high"])),
    boardColumnId: Type.Optional(Type.Integer({ minimum: 1 })),
    sortOrder: Type.Optional(Type.Integer({ minimum: 0 })),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

export const TaskIdParamsSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export const TaskLabelParamsSchema = Type.Object({
  taskId: Type.Integer({ minimum: 1 }),
  labelId: Type.Integer({ minimum: 1 }),
});

export const TaskCreateBodySchema = Type.Object(
  {
    title: Type.String({ minLength: 1, maxLength: 256 }),
    description: Type.Optional(Type.String({ maxLength: 5000 })),
    boardId: Type.Integer({ minimum: 1 }),
    boardColumnId: Type.Optional(Type.Integer({ minimum: 1 })),
    sortOrder: Type.Optional(Type.Integer({ minimum: 0 })),
  },
  {
    additionalProperties: false,
  },
);

export type TaskByBoardIdParams = Type.Static<typeof TaskByBoardIdParamsSchema>;
export type TaskByColumnIdParams = Type.Static<
  typeof TaskByColumnIdParamsSchema
>;
export type TaskUpdateBody = Type.Static<typeof TaskUpdateBodySchema>;
export type TaskIdParams = Type.Static<typeof TaskIdParamsSchema>;
export type TaskLabelParams = Type.Static<typeof TaskLabelParamsSchema>;
export type TaskCreateBody = Type.Static<typeof TaskCreateBodySchema>;

export type TaskGetAllByBoardIdInput = WithActor<TaskByBoardIdParams>;
export type TaskGetAllByColumnIdInput = WithActor<TaskByColumnIdParams>;
export type TaskCreateInput = WithActor<TaskCreateBody>;
export type TaskDeleteInput = WithActor<TaskIdParams>;
export type TaskUpdateInput = WithActor<TaskIdParams & TaskUpdateBody>;
export type TaskGetByIdInput = WithActor<TaskIdParams>;
export type TaskAttachLabelInput = WithActor<TaskLabelParams>;
export type TaskDetachLabelInput = WithActor<TaskLabelParams>;
