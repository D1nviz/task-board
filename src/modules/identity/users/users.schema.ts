import Type from "typebox";
import { rolesEnum, type users } from "./users.table.js";

export const UserResponseSchema = Type.Object({
  id: Type.Number(),
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  role: Type.Enum(rolesEnum.enumValues),
});

export const UserCreateBodySchema = Type.Object({
  email: Type.String({ minLength: 3, maxLength: 256 }),
  firstName: Type.String({ minLength: 1, maxLength: 256 }),
  lastName: Type.String({ minLength: 1, maxLength: 256 }),
  role: Type.Optional(Type.Enum(rolesEnum.enumValues)),
});

export type User = typeof users.$inferSelect;
export type Role = User["role"];
export type UserPublic = Pick<
  User,
  "id" | "email" | "firstName" | "lastName" | "role"
>;

export type UserResponse = Type.Static<typeof UserResponseSchema>;
export type UserCreateBody = Type.Static<typeof UserCreateBodySchema>;

export type UserCreateInput = UserCreateBody;
export type UserFindByEmailInput = Pick<User, "email">;
export type UserFindByIdInput = Pick<User, "id">;
