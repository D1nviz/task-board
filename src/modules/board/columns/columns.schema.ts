import { Type } from "typebox";
import type { WithActor } from "@/core/types/actor.js";

export const ColumnResponseSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  boardId: Type.Number(),
  sortOrder: Type.Number(),
});

export const ColumnCreateBodySchema = Type.Object(
  {
    title: Type.String({ minLength: 1, maxLength: 256 }),
    boardId: Type.Integer({ minimum: 1 }),
    sortOrder: Type.Optional(Type.Integer({ minimum: 0 })),
  },
  {
    additionalProperties: false,
  },
);

export const ColumnUpdateBodySchema = Type.Object(
  {
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 256 })),
    sortOrder: Type.Optional(Type.Integer({ minimum: 0 })),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

export const ColumnByBoardIdParamsSchema = Type.Object({
  boardId: Type.Integer({ minimum: 1 }),
});

export const ColumnIdParamsSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export type ColumnResponse = Type.Static<typeof ColumnResponseSchema>;
export type ColumnCreateBody = Type.Static<typeof ColumnCreateBodySchema>;
export type ColumnUpdateBody = Type.Static<typeof ColumnUpdateBodySchema>;
export type ColumnByBoardIdParams = Type.Static<
  typeof ColumnByBoardIdParamsSchema
>;
export type ColumnIdParams = Type.Static<typeof ColumnIdParamsSchema>;

export type ColumnGetAllByBoardIdInput = WithActor<ColumnByBoardIdParams>;
export type ColumnGetByIdInput = WithActor<ColumnIdParams>;
export type ColumnCreateInput = WithActor<ColumnCreateBody>;
export type ColumnUpdateInput = WithActor<ColumnIdParams & ColumnUpdateBody>;
export type ColumnDeleteInput = WithActor<ColumnIdParams>;
