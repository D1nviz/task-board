import { Type } from "typebox";

export const BoardResponseSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
});

export const BoardCreateBodySchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 256 }),
});

export const BoardIdParamsSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export type BoardResponse = Type.Static<typeof BoardResponseSchema>;
export type BoardCreateBody = Type.Static<typeof BoardCreateBodySchema>;
export type BoardIdParams = Type.Static<typeof BoardIdParamsSchema>;
