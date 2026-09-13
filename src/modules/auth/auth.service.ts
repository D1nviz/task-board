import argon2 from "argon2";
import type { Database } from "../../core/db/types/index.js";
import type { UsersRepository } from "../users/users.repository.js";
import type { AuthRepository } from "./auth.repository.js";
import type { AuthSignUpBodyParams } from "./auth.schema.js";

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly db: Database,
  ) {}

  signUp = async (data: AuthSignUpBodyParams) => {
    const passwordHash = await argon2.hash(data.password);

    return this.db.transaction(async (tx) => {
      const [user] = await this.usersRepository.create(
        {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        tx,
      );

      await this.repository.create(
        {
          userId: user.id,
          passwordHash,
        },
        tx,
      );

      return user;
    });
  };
}
