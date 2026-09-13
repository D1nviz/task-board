import Type from "typebox";
import type { Actor } from "@/core/types/actor.js";
import {
  UserCreateBodySchema,
  type UserPublic,
} from "../users/users.schema.js";
import type { credentials, refreshTokens } from "./auth.table.js";

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

export type Credentials = typeof credentials.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;

export type AuthCredentialsCreateInput = Pick<
  typeof credentials.$inferInsert,
  "userId" | "passwordHash"
>;
export type AuthCredentialsFindInput = Actor;
export type AuthCredentialsUpdateInput = AuthCredentialsCreateInput;

export type AuthRefreshTokenCreateInput = Pick<
  typeof refreshTokens.$inferInsert,
  "tokenHash" | "familyId" | "userId" | "expiresAt"
>;
export type AuthRefreshTokenFindInput = Pick<RefreshToken, "tokenHash">;
export type AuthRefreshTokenFamilyInput = Pick<RefreshToken, "familyId">;
export type AuthRevokeSessionInput = { token: string };
export type AuthRefreshTokenMarkUsedInput = Pick<RefreshToken, "id">;
export type AuthRotateSessionInput = { token: string };

export type AuthRotateSessionResult =
  | { status: "invalid" }
  | {
      status: "reuse";
      userId: RefreshToken["userId"];
      familyId: RefreshToken["familyId"];
    }
  | { status: "ok"; user: UserPublic; refreshToken: string };
export type AuthIssueRefreshTokenInput = Actor & {
  familyId?: RefreshToken["familyId"];
};
export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
};
