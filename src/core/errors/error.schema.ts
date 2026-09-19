import { Type } from "typebox";

export const ErrorResponseSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
  details: Type.Optional(Type.Unknown()),
});

export type ErrorResponse = Type.Static<typeof ErrorResponseSchema>;
