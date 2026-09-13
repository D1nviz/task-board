import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { UserResponseSchema } from "../users/users.schema.js";
import {
  AuthChangePasswordBodySchema,
  AuthSignInBodySchema,
  AuthSignUpBodySchema,
} from "./auth.schema.js";

const authRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { authController } = fastify;

  fastify.post("/sign-up", {
    schema: {
      body: AuthSignUpBodySchema,
    },
    handler: authController.signUp,
  });

  fastify.post("/sign-in", {
    schema: {
      body: AuthSignInBodySchema,
    },
    handler: authController.signIn,
  });

  fastify.get("/me", {
    onRequest: [fastify.authenticate],
    schema: {
      response: {
        200: UserResponseSchema,
      },
    },
    handler: authController.me,
  });

  fastify.post("/logout", {
    onRequest: [fastify.authenticate],
    handler: authController.logout,
  });

  fastify.post("/change-password", {
    onRequest: [fastify.authenticate],
    schema: {
      body: AuthChangePasswordBodySchema,
    },
    handler: authController.changePassword,
  });
};

export default authRoutes;
