export const LOG_LEVELS = {
  info: "info",
  warn: "warn",
  error: "error",
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;
