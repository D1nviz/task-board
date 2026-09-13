import { eq } from "drizzle-orm";
import type { Database, Transaction } from "../../core/db/types/index.js";
import type {
  UserCreateInput,
  UserFindByEmailInput,
  UserFindByIdInput,
} from "./users.schema.js";
import { users } from "./users.table.js";

export class UsersRepository {
  constructor(private readonly db: Database) {}

  create = async (data: UserCreateInput, tx?: Transaction) => {
    return (tx ?? this.db).insert(users).values(data).returning();
  };

  findByEmail = ({ email }: UserFindByEmailInput) => {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  };

  findById = ({ id }: UserFindByIdInput) => {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  };
}
