import { eq, lt } from "drizzle-orm";
import type { Database, Transaction } from "@/core/db/types/index.js";
import type {
  AuthCredentialsCreateInput,
  AuthCredentialsFindInput,
  AuthCredentialsUpdateInput,
  AuthRefreshTokenCreateInput,
  AuthRefreshTokenFamilyInput,
  AuthRefreshTokenFindInput,
  AuthRefreshTokenMarkUsedInput,
} from "./auth.schema.js";
import { credentials, refreshTokens } from "./auth.table.js";

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

  createRefreshToken = async (
    data: AuthRefreshTokenCreateInput,
    tx?: Transaction,
  ) => {
    return (tx ?? this.db).insert(refreshTokens).values(data);
  };

  markRefreshTokenUsed = (
    { id }: AuthRefreshTokenMarkUsedInput,
    tx?: Transaction,
  ) => {
    return (tx ?? this.db)
      .update(refreshTokens)
      .set({ usedAt: new Date() })
      .where(eq(refreshTokens.id, id))
      .returning({ id: refreshTokens.id });
  };

  deleteExpired = () => {
    return this.db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()))
      .returning({ id: refreshTokens.id });
  };

  findRefreshToken = ({ tokenHash }: AuthRefreshTokenFindInput) => {
    return this.db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, tokenHash),
    });
  };

  deleteFamily = ({ familyId }: AuthRefreshTokenFamilyInput) => {
    return this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.familyId, familyId));
  };

  updatePassword = ({ userId, passwordHash }: AuthCredentialsUpdateInput) => {
    return this.db
      .update(credentials)
      .set({ passwordHash })
      .where(eq(credentials.userId, userId))
      .returning({ userId: credentials.userId });
  };
}
