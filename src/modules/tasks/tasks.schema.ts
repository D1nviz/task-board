import { Type } from "typebox";

export const TaskByBoardIdSchema = Type.Object({
  boardId: Type.Integer({ minimum: 1 }),
});

export const TaskByColumnIdSchema = Type.Object({
  columnId: Type.Integer({ minimum: 1 }),
});

export const TaskIdParamsSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export const TaskLabelParamsSchema = Type.Object({
  taskId: Type.Integer({ minimum: 1 }),
  labelId: Type.Integer({ minimum: 1 }),
});

export const TaskCreateBodySchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 256 }),
  description: Type.Optional(Type.String({ maxLength: 5000 })),
  boardId: Type.Integer({ minimum: 1 }),
  boardColumnId: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type TaskByBoardIdParams = Type.Static<typeof TaskByBoardIdSchema>;
export type TaskByColumnIdParams = Type.Static<typeof TaskByColumnIdSchema>;
export type TaskIdParams = Type.Static<typeof TaskIdParamsSchema>;
export type TaskLabelParams = Type.Static<typeof TaskLabelParamsSchema>;
export type TaskCreateBodyParams = Type.Static<typeof TaskCreateBodySchema>;
