import Type from "typebox";

export const UserCreateBodySchema = Type.Object({
  email: Type.String({ minLength: 3, maxLength: 256 }),
  firstName: Type.String({ minLength: 1, maxLength: 256 }),
  lastName: Type.String({ minLength: 1, maxLength: 256 }),
  role: Type.Optional(Type.Enum(["admin", "user"])),
});

export type UserCreateBodyParams = Type.Static<typeof UserCreateBodySchema>;
