import { sql } from "drizzle-orm";
import type { Database } from "@/core/db/types/index.js";
import {
  DEPENDENCY_STATUSES,
  HEALTH_STATUSES,
  type HealthResponse,
} from "./health.schema.js";

export class HealthService {
  constructor(private readonly db: Database) {}

  private checkDatabase = async () => {
    try {
      await this.db.execute(sql`select 1`);
      return DEPENDENCY_STATUSES.up;
    } catch {
      return DEPENDENCY_STATUSES.down;
    }
  };

  check = async (): Promise<HealthResponse> => {
    const database = await this.checkDatabase();
    const status =
      database === DEPENDENCY_STATUSES.up
        ? HEALTH_STATUSES.ok
        : HEALTH_STATUSES.degraded;

    return { status, database };
  };
}
