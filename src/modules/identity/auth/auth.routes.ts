import {
  type FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { HTTP_STATUS } from "@/core/constants/http.constants.js";
import { ErrorResponseSchema } from "@/core/errors/index.js";
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
      summary: "Create an account and start a session",
      body: AuthSignUpBodySchema,
      response: {
        [HTTP_STATUS.created]: UserResponseSchema,
        [HTTP_STATUS.conflict]: ErrorResponseSchema,
      },
    },
    handler: authController.signUp,
  });

  fastify.post("/sign-in", {
    schema: {
      summary: "Start a session",
      body: AuthSignInBodySchema,
      response: {
        [HTTP_STATUS.ok]: UserResponseSchema,
        [HTTP_STATUS.unauthorized]: ErrorResponseSchema,
      },
    },
    handler: authController.signIn,
  });

  fastify.post("/refresh", {
    schema: {
      summary: "Rotate the refresh token and issue a new access token",
      response: {
        [HTTP_STATUS.noContent]: Type.Null(),
        [HTTP_STATUS.unauthorized]: ErrorResponseSchema,
      },
    },
    handler: authController.refresh,
  });

  fastify.get("/me", {
    onRequest: [fastify.authenticate],
    schema: {
      summary: "Current user",
      response: {
        [HTTP_STATUS.ok]: UserResponseSchema,
      },
    },
    handler: authController.me,
  });

  fastify.post("/logout", {
    onRequest: [fastify.authenticate],
    schema: {
      summary: "Revoke the session family and clear cookies",
      response: {
        [HTTP_STATUS.noContent]: Type.Null(),
      },
    },
    handler: authController.logout,
  });

  fastify.post("/change-password", {
    onRequest: [fastify.authenticate],
    schema: {
      summary: "Change the password of the current user",
      body: AuthChangePasswordBodySchema,
      response: {
        [HTTP_STATUS.noContent]: Type.Null(),
      },
    },
    handler: authController.changePassword,
  });
};

export default authRoutes;
