import argon2 from "argon2";
import type { Database } from "@/core/db/types/index.js";
import type { UsersRepository } from "../users/users.repository.js";
import type { AuthRepository } from "./auth.repository.js";
import type {
  AuthChangePasswordInput,
  AuthMeInput,
  AuthSignInInput,
  AuthSignUpInput,
} from "./auth.schema.js";

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly db: Database,
  ) {}

  signUp = async (data: AuthSignUpInput) => {
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

  signIn = async ({ email, password }: AuthSignInInput) => {
    const user = await this.usersRepository.findByEmail({ email });

    if (!user) {
      return null;
    }

    const creds = await this.repository.findByUserId({ userId: user.id });

    if (!creds || !(await argon2.verify(creds.passwordHash, password))) {
      return null;
    }

    return user;
  };

  me = ({ userId }: AuthMeInput) => {
    return this.usersRepository.findById({ id: userId });
  };

  changePassword = async ({
    userId,
    currentPassword,
    newPassword,
  }: AuthChangePasswordInput) => {
    const creds = await this.repository.findByUserId({ userId });

    if (!creds || !(await argon2.verify(creds.passwordHash, currentPassword))) {
      return null;
    }

    const passwordHash = await argon2.hash(newPassword);

    return this.repository.updatePassword({ userId, passwordHash });
  };
}
