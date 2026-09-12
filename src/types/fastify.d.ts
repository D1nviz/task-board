import type { Database } from "../core/db/types/index.js";
import type { BoardsController } from "../modules/boards/boards.controller.js";
import type { LabelsController } from "../modules/labels/labels.controller.js";
import type { TasksController } from "../modules/tasks/tasks.controller.js";

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
    labelsController: LabelsController;
    tasksController: TasksController;
  }
}
