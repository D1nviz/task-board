import type { Database, Transaction } from "../../core/db/types/index.js";
import { credentials } from "./auth.table.js";

export class AuthRepository {
  constructor(private readonly db: Database) {}

  create = (
    {
      userId,
      passwordHash,
    }: {
      userId: number;
      passwordHash: string;
    },
    tx?: Transaction,
  ) => {
    return (tx ?? this.db)
      .insert(credentials)
      .values({
        userId,
        passwordHash,
      })
      .returning({ userId: credentials.userId });
  };
}
