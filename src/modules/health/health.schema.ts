import { Type } from "typebox";

export const HEALTH_STATUSES = {
  ok: "ok",
  degraded: "degraded",
} as const;

export const DEPENDENCY_STATUSES = {
  up: "up",
  down: "down",
} as const;

export const HealthResponseSchema = Type.Object({
  status: Type.Enum(Object.values(HEALTH_STATUSES)),
  database: Type.Enum(Object.values(DEPENDENCY_STATUSES)),
});

export type HealthResponse = Type.Static<typeof HealthResponseSchema>;
