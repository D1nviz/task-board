import { LOG_LEVELS } from "@/core/constants/log.constants.js";
import { ConflictError, UnauthorizedError } from "@/core/errors/index.js";

export const AUTH_ERROR_CODES = {
  invalidCredentials: "AUTH_INVALID_CREDENTIALS",
  invalidCurrentPassword: "AUTH_INVALID_CURRENT_PASSWORD",
  emailTaken: "AUTH_EMAIL_TAKEN",
  noRefreshToken: "AUTH_NO_REFRESH_TOKEN",
  invalidRefreshToken: "AUTH_INVALID_REFRESH_TOKEN",
  refreshTokenReuse: "AUTH_REFRESH_TOKEN_REUSE",
  userNotFound: "AUTH_USER_NOT_FOUND",
} as const;

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super({
      code: AUTH_ERROR_CODES.invalidCredentials,
      message: "Invalid email or password",
    });
  }
}

export class InvalidCurrentPasswordError extends UnauthorizedError {
  constructor() {
    super({
      code: AUTH_ERROR_CODES.invalidCurrentPassword,
      message: "Invalid current password",
    });
  }
}

export class EmailTakenError extends ConflictError {
  constructor({ email }: { email: string }) {
    super({
      code: AUTH_ERROR_CODES.emailTaken,
      message: "Email already registered",
      details: { email },
    });
  }
}

export class NoRefreshTokenError extends UnauthorizedError {
  constructor() {
    super({
      code: AUTH_ERROR_CODES.noRefreshToken,
      message: "No refresh token",
    });
  }
}

export class InvalidRefreshTokenError extends UnauthorizedError {
  constructor() {
    super({
      code: AUTH_ERROR_CODES.invalidRefreshToken,
      message: "Invalid refresh token",
    });
  }
}

export class RefreshTokenReuseError extends UnauthorizedError {
  constructor({ userId, familyId }: { userId: number; familyId: string }) {
    super({
      code: AUTH_ERROR_CODES.refreshTokenReuse,
      message: "Refresh token reuse detected",
      context: { userId, familyId },
      logLevel: LOG_LEVELS.warn,
    });
  }
}

export class AuthUserNotFoundError extends UnauthorizedError {
  constructor({ userId }: { userId: number }) {
    super({
      code: AUTH_ERROR_CODES.userNotFound,
      message: "User no longer exists",
      context: { userId },
    });
  }
}
