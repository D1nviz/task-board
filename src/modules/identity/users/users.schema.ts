import Type from "typebox";

export const UserResponseSchema = Type.Object({
  id: Type.Number(),
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  role: Type.Enum(["admin", "user"]),
});

export const UserCreateBodySchema = Type.Object({
  email: Type.String({ minLength: 3, maxLength: 256 }),
  firstName: Type.String({ minLength: 1, maxLength: 256 }),
  lastName: Type.String({ minLength: 1, maxLength: 256 }),
  role: Type.Optional(Type.Enum(["admin", "user"])),
});

export type UserResponse = Type.Static<typeof UserResponseSchema>;
export type UserCreateBody = Type.Static<typeof UserCreateBodySchema>;

export type UserCreateInput = UserCreateBody;
export type UserFindByEmailInput = { email: string };
export type UserFindByIdInput = { id: number };
