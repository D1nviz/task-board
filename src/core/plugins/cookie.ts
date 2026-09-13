import cookie, { type FastifyCookieOptions } from "@fastify/cookie";
import fp from "fastify-plugin";

export default fp<FastifyCookieOptions>(async (fastify) => {
  await fastify.register(cookie);
});
