import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import fp from "fastify-plugin";

const swaggerPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.1.0",
      info: { title: "Task manager", version: "0.1.0" },
    },
  });

  await fastify.register(fastifySwaggerUi, { routePrefix: "/docs" });
};

export default fp(swaggerPlugin, { name: "swagger-plugin" });
