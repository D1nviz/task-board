import { Type } from "typebox";
import type { WithActor } from "@/core/types/actor.js";

export const LabelResponseSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  boardId: Type.Number(),
});

export const LabelCreateBodySchema = Type.Object(
  {
    name: Type.String({ minLength: 1, maxLength: 100 }),
    boardId: Type.Integer({ minimum: 1 }),
  },
  {
    additionalProperties: false,
  },
);

export const LabelUpdateBodySchema = Type.Object(
  {
    name: Type.String({ minLength: 1, maxLength: 100 }),
  },
  {
    additionalProperties: false,
  },
);

export const LabelByBoardIdParamsSchema = Type.Object({
  boardId: Type.Integer({ minimum: 1 }),
});

export const LabelIdParamsSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export type LabelResponse = Type.Static<typeof LabelResponseSchema>;
export type LabelCreateBody = Type.Static<typeof LabelCreateBodySchema>;
export type LabelUpdateBody = Type.Static<typeof LabelUpdateBodySchema>;
export type LabelByBoardIdParams = Type.Static<
  typeof LabelByBoardIdParamsSchema
>;
export type LabelIdParams = Type.Static<typeof LabelIdParamsSchema>;

export type LabelGetAllByBoardIdInput = WithActor<LabelByBoardIdParams>;
export type LabelGetByIdInput = WithActor<LabelIdParams>;
export type LabelCreateInput = WithActor<LabelCreateBody>;
export type LabelUpdateInput = WithActor<LabelIdParams & LabelUpdateBody>;
export type LabelDeleteInput = WithActor<LabelIdParams>;
