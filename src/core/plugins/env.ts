import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import fp from "fastify-plugin";
import { Type } from "typebox";
import { Value } from "typebox/value";
import { NODE_ENVS } from "../constants/env.constants.js";

export const EnvSchema = Type.Object({
  NODE_ENV: Type.Enum(Object.values(NODE_ENVS), {
    default: NODE_ENVS.development,
  }),
  HOST: Type.String({ default: "0.0.0.0" }),
  PORT: Type.Integer({ minimum: 1, maximum: 65535, default: 8080 }),
  CORS_ORIGIN: Type.Optional(Type.String()),
  DATABASE_URL: Type.String({ minLength: 1 }),
  JWT_SECRET: Type.String({ minLength: 1 }),
});

export type EnvConfig = Type.Static<typeof EnvSchema>;

const parseEnv = (env: NodeJS.ProcessEnv) => {
  const candidate = Value.Clean(
    EnvSchema,
    Value.Convert(EnvSchema, Value.Default(EnvSchema, { ...env })),
  );

  if (Value.Check(EnvSchema, candidate)) {
    return candidate;
  }

  const issues = [...Value.Errors(EnvSchema, candidate)]
    .map(({ instancePath, message }) => `${instancePath || "/"} ${message}`)
    .join("; ");

  throw new Error(`Invalid environment: ${issues}`);
};

const envPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.decorate("config", parseEnv(process.env));
};

export default fp(envPlugin, { name: "env-plugin" });
