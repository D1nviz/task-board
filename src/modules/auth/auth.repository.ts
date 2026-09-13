import { eq } from "drizzle-orm";
import type { Database, Transaction } from "../../core/db/types/index.js";
import type {
  AuthCredentialsCreateInput,
  AuthCredentialsFindInput,
  AuthCredentialsUpdateInput,
} from "./auth.schema.js";
import { credentials } from "./auth.table.js";

export class AuthRepository {
  constructor(private readonly db: Database) {}

  create = (data: AuthCredentialsCreateInput, tx?: Transaction) => {
    return (tx ?? this.db)
      .insert(credentials)
      .values(data)
      .returning({ userId: credentials.userId });
  };

  findByUserId = ({ userId }: AuthCredentialsFindInput) => {
    return this.db.query.credentials.findFirst({
      where: eq(credentials.userId, userId),
    });
  };

  updatePassword = ({ userId, passwordHash }: AuthCredentialsUpdateInput) => {
    return this.db
      .update(credentials)
      .set({ passwordHash })
      .where(eq(credentials.userId, userId))
      .returning({ userId: credentials.userId });
  };
}
