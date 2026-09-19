import { API_PREFIX } from "@/core/constants/api.constants.js";

export const AUTH_TOKENS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
} as const;

export const AUTH_TOKENS_TTL = {
  [AUTH_TOKENS.accessToken]: 60 * 15, // 15 minutes
  [AUTH_TOKENS.refreshToken]: 60 * 60 * 24 * 7, // 7 days
} as const;

export const AUTH_COOKIE_PATHS = {
  [AUTH_TOKENS.accessToken]: "/",
  [AUTH_TOKENS.refreshToken]: `${API_PREFIX}/auth/refresh`,
} as const;

export const AUTH_REFRESH_TOKEN_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
