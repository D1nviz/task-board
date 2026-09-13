import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { AuthSignUpBodySchema } from "./auth.schema.js";

const authRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { authController } = fastify;

  fastify.post("/sign-up", {
    schema: {
      body: AuthSignUpBodySchema,
    },
    handler: authController.signUp,
  });
};

export default authRoutes;
