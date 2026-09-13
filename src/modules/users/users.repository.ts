import type { Database, Transaction } from "../../core/db/types/index.js";
import type { UserCreateBodyParams } from "./users.schema.js";
import { users } from "./users.table.js";

export class UsersRepository {
  constructor(private readonly db: Database) {}

  create = async (data: UserCreateBodyParams, tx?: Transaction) => {
    return (tx ?? this.db).insert(users).values(data).returning({
      id: users.id,
    });
  };
}
