import fastifyEnv from "@fastify/env";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import fp from "fastify-plugin";

const schema = {
  type: "object",
  required: ["NODE_ENV", "PORT", "JWT_SECRET"],
  properties: {
    NODE_ENV: { type: "string", default: "development" },
    PORT: { type: "number", default: 8080 },
    CORS_ORIGIN: { type: "string" },
    DATABASE_URL: { type: "string" },
    JWT_SECRET: { type: "string" },
  },
};

const envPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  await fastify.register(fastifyEnv, {
    schema,
    dotenv: true,
  });
};

export default fp(envPlugin, { name: "env-plugin" });
