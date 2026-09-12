import type { Database } from "../core/db/types/index.ts";
import type { BoardsController } from "../modules/boards/boards.controller.js";
import type { TasksController } from "../modules/tasks/tasks.controller.ts";

export interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  CORS_ORIGIN?: string;
  DATABASE_URL?: string;
}

declare module "fastify" {
  interface FastifyInstance {
    config: EnvConfig;
    db: Database;
    boardsController: BoardsController;
    tasksController: TasksController;
  }
}
