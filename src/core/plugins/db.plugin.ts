import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { drizzle } from "drizzle-orm/node-postgres";
import fp from "fastify-plugin";
import { Pool } from "pg";
import { NODE_ENVS } from "../constants/env.constants.js";
import * as schema from "../db/schema.js";

const dbPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const pool = new Pool({
    connectionString: fastify.config.DATABASE_URL,
    ssl:
      fastify.config.NODE_ENV === NODE_ENVS.production
        ? { rejectUnauthorized: false }
        : false,
  });

  const db = drizzle(pool, { schema });

  fastify.decorate("db", db);

  fastify.addHook("onClose", async () => {
    await pool.end();
  });
};

export default fp(dbPlugin, {
  name: "db-plugin",
  dependencies: ["env-plugin"],
});
