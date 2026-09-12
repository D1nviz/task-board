import { join } from "node:path";
import AutoLoad from "@fastify/autoload";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

const autoloadPlugin: FastifyPluginAsyncTypebox = async (fastify) => {
  await fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, "../../modules"),
    matchFilter: (path) => /\.module\.(ts|js)$/.test(path),
  });
};

export default autoloadPlugin;
