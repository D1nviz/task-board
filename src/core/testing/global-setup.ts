import { join } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client, Pool } from "pg";
// Node loads the global setup natively (type stripping, no tsx hooks), so the
// import needs the real extension.
import { resolveTestDatabase } from "./database.ts";

const MIGRATIONS_FOLDER = join(import.meta.dirname, "../../../drizzle");

const requireDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run tests");
  }

  return databaseUrl;
};

export async function globalSetup() {
  const databaseUrl = requireDatabaseUrl();
  const { testName, testUrl } = resolveTestDatabase({ databaseUrl });

  const admin = new Client({ connectionString: databaseUrl });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${testName}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${testName}"`);
  } finally {
    await admin.end();
  }

  const pool = new Pool({ connectionString: testUrl });
  try {
    await migrate(drizzle(pool), { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await pool.end();
  }
}
