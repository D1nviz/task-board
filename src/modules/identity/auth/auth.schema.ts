import Type from "typebox";
import type { Actor } from "@/core/types/actor.js";
import { UserCreateBodySchema } from "../users/users.schema.js";

export const AuthSignUpBodySchema = Type.Object(
  {
    ...Type.Omit(UserCreateBodySchema, ["role"]).properties,
    password: Type.String({ minLength: 6, maxLength: 128 }),
  },
  { additionalProperties: false },
);

export const AuthSignInBodySchema = Type.Object(
  {
    email: Type.String({ minLength: 3, maxLength: 256 }),
    password: Type.String({ minLength: 6, maxLength: 128 }),
  },
  { additionalProperties: false },
);

export const AuthChangePasswordBodySchema = Type.Object(
  {
    currentPassword: Type.String({ minLength: 6, maxLength: 128 }),
    newPassword: Type.String({ minLength: 6, maxLength: 128 }),
  },
  { additionalProperties: false },
);

export type AuthSignUpBody = Type.Static<typeof AuthSignUpBodySchema>;
export type AuthSignInBody = Type.Static<typeof AuthSignInBodySchema>;
export type AuthChangePasswordBody = Type.Static<
  typeof AuthChangePasswordBodySchema
>;

export type AuthSignUpInput = AuthSignUpBody;
export type AuthSignInInput = AuthSignInBody;
export type AuthMeInput = Actor;
export type AuthChangePasswordInput = AuthChangePasswordBody & Actor;

export type AuthCredentialsCreateInput = {
  userId: number;
  passwordHash: string;
};
export type AuthCredentialsFindInput = Actor;
export type AuthCredentialsUpdateInput = AuthCredentialsCreateInput;
