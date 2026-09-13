import { Type } from "typebox";

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

export const BoardIdParamsSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

type UserId = number;

export type BoardResponse = Type.Static<typeof BoardResponseSchema>;
export type BoardCreateBody = Type.Static<typeof BoardCreateBodySchema>;
export type BoardCreateData = BoardCreateBody & { userId: UserId };

export type BoardIdParams = Type.Static<typeof BoardIdParamsSchema>;
export type BoardGetAllParams = { userId: UserId };
export type BoardDeleteParams = BoardIdParams & {
  userId: UserId;
};
