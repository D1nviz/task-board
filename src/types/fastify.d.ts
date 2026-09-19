import type { Database } from "../core/db/types/index.js";
import type { EnvConfig } from "../core/plugins/env.js";
import type { BoardsController } from "../modules/board/boards/boards.controller.js";
import type { ColumnsController } from "../modules/board/columns/columns.controller.js";
import type { LabelsController } from "../modules/board/labels/labels.controller.js";
import type { TasksController } from "../modules/board/tasks/tasks.controller.js";
import type { HealthController } from "../modules/health/health.controller.js";
import type { AuthController } from "../modules/identity/auth/auth.controller.js";
import type { Role } from "../modules/identity/users/users.schema.js";
import type { NotesController } from "../modules/notes/notes.controller.js";

export type { EnvConfig };

declare module "fastify" {
  interface FastifyInstance {
    config: EnvConfig;
    db: Database;
    authController: AuthController;
    healthController: HealthController;
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
    payload: { id: number; role: Role };
    user: { id: number; role: Role };
  }
}
