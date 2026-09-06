import cors from "@fastify/cors";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import fp from "fastify-plugin";

const corsPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const origins = fastify.config.CORS_ORIGIN
    ? fastify.config.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : true;

  await fastify.register(cors, {
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
};

export default fp(corsPlugin, {
  name: "cors-plugin",
  dependencies: ["env-plugin"],
});
