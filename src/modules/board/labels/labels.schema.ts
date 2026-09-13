import { Type } from "typebox";

export const LabelResponseSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
});

export const LabelCreateBodySchema = Type.Object(
  {
    name: Type.String({ minLength: 1, maxLength: 100 }),
  },
  {
    additionalProperties: false,
  },
);

export const LabelUpdateBodySchema = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

export const LabelIdParamsSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export type LabelResponse = Type.Static<typeof LabelResponseSchema>;
export type LabelCreateBody = Type.Static<typeof LabelCreateBodySchema>;
export type LabelUpdateBody = Type.Static<typeof LabelUpdateBodySchema>;
export type LabelIdParams = Type.Static<typeof LabelIdParamsSchema>;

export type LabelCreateInput = LabelCreateBody;
export type LabelDeleteInput = LabelIdParams;
export type LabelUpdateInput = LabelIdParams & LabelUpdateBody;
