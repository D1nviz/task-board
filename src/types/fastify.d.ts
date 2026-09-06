import { FastifyInstance } from "fastify";
import { BoardsController } from "../modules/boards/boards.controller.js";

export interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  CORS_ORIGIN?: string;
  DATABASE_URL?: string;
}

declare module "fastify" {
  interface FastifyInstance {
    config: EnvConfig;
    db: NodePgDatabase<typeof schema>;
    boardsController: BoardsController;
  }
}
