import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";
import autoloadPlugin from "./core/plugins/autoload.js";
import corsPlugin from "./core/plugins/cors.js";
import dbPlugin from "./core/plugins/db.plugin.js";
import envPlugin from "./core/plugins/env.js";
import swaggerPlugin from "./core/plugins/swagger.js";

export function buildApp() {
  const app = Fastify({
    logger: { transport: { target: "pino-pretty" } },
  }).withTypeProvider<TypeBoxTypeProvider>();

  app.register(envPlugin);
  app.register(corsPlugin);
  app.register(dbPlugin);
  app.register(swaggerPlugin);
  app.register(autoloadPlugin);

  return app;
}
