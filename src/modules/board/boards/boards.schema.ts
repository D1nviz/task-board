import { Type } from "typebox";
import type { Actor, WithActor } from "@/core/types/actor.js";

export const BoardResponseSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
});

export const BoardCreateBodySchema = Type.Object(
  {
    title: Type.String({ minLength: 1, maxLength: 256 }),
  },
  {
    additionalProperties: false,
  },
);

export const BoardUpdateBodySchema = Type.Object(
  {
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 256 })),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

export const BoardIdParamsSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export type BoardResponse = Type.Static<typeof BoardResponseSchema>;
export type BoardCreateBody = Type.Static<typeof BoardCreateBodySchema>;
export type BoardUpdateBody = Type.Static<typeof BoardUpdateBodySchema>;
export type BoardIdParams = Type.Static<typeof BoardIdParamsSchema>;

export type BoardGetAllInput = Actor;
export type BoardCreateInput = WithActor<BoardCreateBody>;
export type BoardDeleteInput = WithActor<BoardIdParams>;
export type BoardGetByIdInput = WithActor<BoardIdParams>;
export type BoardUpdateInput = WithActor<BoardIdParams & BoardUpdateBody>;
