import Type from "typebox";
import { UserCreateBodySchema } from "../users/users.schema.js";

export const AuthSignUpBodySchema = Type.Object(
  {
    ...Type.Omit(UserCreateBodySchema, ["role"]).properties,
    password: Type.String({ minLength: 6, maxLength: 128 }),
  },
  { additionalProperties: false },
);

export type AuthSignUpBodyParams = Type.Static<typeof AuthSignUpBodySchema>;
