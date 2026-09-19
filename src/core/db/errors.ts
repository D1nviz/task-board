import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";

export const PG_ERROR_CODES = {
  uniqueViolation: "23505",
  foreignKeyViolation: "23503",
  notNullViolation: "23502",
  checkViolation: "23514",
} as const;

export const unwrapPgError = (error: unknown) => {
  const cause = error instanceof DrizzleQueryError ? error.cause : error;
  return cause instanceof DatabaseError ? cause : undefined;
};

const matchesPgCode =
  (expected: string) =>
  ({ error, constraint }: { error: unknown; constraint?: string }) => {
    const pgError = unwrapPgError(error);

    if (!pgError || pgError.code !== expected) {
      return false;
    }

    return constraint === undefined || pgError.constraint === constraint;
  };

export const isUniqueViolation = matchesPgCode(PG_ERROR_CODES.uniqueViolation);
export const isForeignKeyViolation = matchesPgCode(
  PG_ERROR_CODES.foreignKeyViolation,
);
export const isNotNullViolation = matchesPgCode(
  PG_ERROR_CODES.notNullViolation,
);
export const isCheckViolation = matchesPgCode(PG_ERROR_CODES.checkViolation);
