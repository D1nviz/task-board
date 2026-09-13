import fastifyJwt from "@fastify/jwt";

import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import fp from "fastify-plugin";

const jwtPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET,
    cookie: {
      cookieName: "accessToken",
      signed: false,
    },
  });

  fastify.decorate("authenticate", async (request) => {
    await request.jwtVerify();
  });
};

export default fp(jwtPlugin, {
  name: "jwt-plugin",
  dependencies: ["env-plugin"],
});
