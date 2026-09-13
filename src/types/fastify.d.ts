import type { Database } from "../core/db/types/index.js";
import type { BoardsController } from "../modules/board/boards/boards.controller.js";
import type { ColumnsController } from "../modules/board/columns/columns.controller.js";
import type { LabelsController } from "../modules/board/labels/labels.controller.js";
import type { TasksController } from "../modules/board/tasks/tasks.controller.js";
import type { AuthController } from "../modules/identity/auth/auth.controller.js";
import type { NotesController } from "../modules/notes/notes.controller.js";

export interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  CORS_ORIGIN?: string;
  DATABASE_URL?: string;
  JWT_SECRET: string;
}

declare module "fastify" {
  interface FastifyInstance {
    config: EnvConfig;
    db: Database;
    authController: AuthController;
    boardsController: BoardsController;
    columnsController: ColumnsController;
    labelsController: LabelsController;
    notesController: NotesController;
    tasksController: TasksController;
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: number; role: "admin" | "user" };
    user: { id: number; role: "admin" | "user" };
  }
}
