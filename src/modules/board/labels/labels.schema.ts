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

export const LabelIdParamsSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export type LabelResponse = Type.Static<typeof LabelResponseSchema>;
export type LabelCreateBody = Type.Static<typeof LabelCreateBodySchema>;
export type LabelIdParams = Type.Static<typeof LabelIdParamsSchema>;

export type LabelCreateInput = LabelCreateBody;
export type LabelDeleteInput = LabelIdParams;
