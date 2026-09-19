# Task board API

A Fastify 5 backend built as a training ground: a small kanban-style API (boards, columns, labels, tasks, notes) used to work out and collect back-end practices that hold up in real projects. Every decision in the repository is deliberate and most of them are explained below.

## Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js 24, native `.env` loading, native test runner |
| HTTP | Fastify 5, `@fastify/autoload`, `@fastify/jwt`, `@fastify/cookie`, `@fastify/cors` |
| Validation and types | TypeBox, one schema is both the runtime validator and the TypeScript type |
| Database | PostgreSQL 17, Drizzle ORM, Drizzle Kit migrations |
| Auth | Argon2 password hashing, JWT access token, rotating refresh tokens, httpOnly cookies |
| Docs | OpenAPI 3.1 via `@fastify/swagger`, served at `/docs` |
| Tooling | TypeScript, Biome, tsx |

## What is worth looking at

**Deep modules.** Every feature lives in one folder with a fixed set of files. A module owns its table, schemas, repository, service, controller, routes, errors and tests. Nothing about a module leaks outside it except what other modules import on purpose.

```
src/modules/board/tasks/
  tasks.table.ts        Drizzle table and relations
  tasks.schema.ts       TypeBox schemas, request and response types
  tasks.repository.ts   queries only, no business rules
  tasks.service.ts      business rules, throws domain errors
  tasks.controller.ts   HTTP adapter, no logic
  tasks.routes.ts       route definitions with full OpenAPI metadata
  tasks.errors.ts       error codes and error classes of this module
  tasks.module.ts       wiring: instantiates the layers, registers routes
  tests/                integration tests through the HTTP layer
```

Modules are discovered by `@fastify/autoload`, so adding a feature means adding a folder, not editing a registry.

**One error architecture.** `src/core/errors` defines `AppError` and six HTTP-shaped subclasses (`BadRequest`, `Unauthorized`, `Forbidden`, `NotFound`, `Conflict`, `Validation`). Each module extends them with its own errors and a stable machine-readable code:

```ts
export class BoardNotFoundError extends NotFoundError {
  constructor({ boardId }: { boardId: number }) {
    super({
      code: BOARDS_ERROR_CODES.notFound,
      message: "Board not found",
      details: { boardId },
    });
  }
}
```

Services throw, controllers never check for `null`, and a single `setErrorHandler` turns anything into the same response shape `{ code, message, details? }`. Domain errors carry two payloads: `details` goes to the client, `context` only to the logs, so a refresh token reuse can be logged with the user id without leaking it. Anything that is not an `AppError` becomes a generic 500 with the original error logged.

**Database errors are translated where the meaning is known.** `src/core/db/errors.ts` exposes `isUniqueViolation`, `isForeignKeyViolation` and friends. They unwrap Drizzle's `DrizzleQueryError` and match the Postgres error code and, optionally, the constraint name. Constraint names are declared next to the table and exported from it, so the service that catches the violation and the table that defines it cannot drift apart:

```ts
throw isUniqueViolation({ error, constraint: USERS_CONSTRAINTS.emailUnique })
  ? new EmailTakenError({ email })
  : error;
```

**Ownership is enforced at the board level, not just the user level.** A task can only be placed in a column of its own board, a label can only be attached to a task of the same board, and listing another user's board answers `404`, never `403`, so resource ids are not confirmed to strangers. `BoardAccess` is the single shared guard for the three board sub-modules.

**Auth done properly.** Sign-in issues a 15 minute JWT access token and a 7 day refresh token, both httpOnly cookies with scoped paths. Refresh rotates the token; presenting an already used token revokes the whole token family and logs a warning. Expired tokens are purged hourly by a job that starts with the app. Deleting a user invalidates their live session with a `401` that also clears the cookies.

**Health means the database answers.** `GET /api/health` runs `select 1` and returns `200 { status: "ok", database: "up" }`, or `503 { status: "degraded", database: "down" }` when it does not, so an orchestrator restarts the right thing.

**Configuration is a schema.** `src/core/plugins/env.ts` describes the environment with TypeBox, applies defaults, converts `PORT` to a number and refuses to start with a readable list of what is wrong. The `EnvConfig` type is derived from the schema, there is no hand-written duplicate.

**OpenAPI without repetition.** One `onRoute` hook per module adds the tag, the cookie security scheme and the shared `400` and `401` responses. Routes only declare what is specific to them: summaries, success schemas, `404` and `409`. Protected routes are detected from their `onRequest` hooks, so the auth module marks `me`, `logout` and `change-password` as secured without any extra declaration. Because every route has response schemas, responses are serialised through them and internal columns never leak.

**Tests run against a real database.** Node's built-in test runner, `app.inject` for HTTP, a dedicated `<database>_test` database recreated from migrations before every run. Each test file signs up its own users, so files run in parallel without touching each other or the development data. There are no mocks of the database.

## Conventions

- No magic strings. Error codes, HTTP statuses, Postgres error codes, constraint names, cookie names and log levels live in `as const` objects.
- Functions with more than one argument take a single destructured object. The trailing optional `tx?: Transaction` on repository methods is the one exception.
- Rely on TypeScript inference. Types are written for parameters, everything else is inferred, and utility-type constructions are avoided in favour of data shapes that infer cleanly.
- Services are the only layer that knows about business rules and the only layer that throws domain errors.

## Project layout

```
src/
  app.ts                 builds the Fastify instance
  server.ts              loads .env, starts the server
  core/
    constants/           HTTP statuses, error codes, docs tags, env names
    db/                  Drizzle schema aggregation, types, error helpers
    docs/                onRoute hook that documents a module
    errors/              AppError hierarchy and the error response schema
    plugins/             env, db, jwt, cookie, cors, swagger, error handler, autoload
    testing/             test database setup and HTTP test helpers
  modules/
    health/
    identity/auth/       sessions, credentials, refresh tokens
    identity/users/      users table and repository
    board/boards/
    board/columns/
    board/labels/
    board/tasks/
    notes/
drizzle/                 SQL migrations generated by Drizzle Kit
```

## Getting started

Requirements: Node.js 24 or newer, Docker.

1. Start PostgreSQL:

   ```sh
   docker run -d --name task-board-db \
     -e POSTGRES_DB=task_board \
     -e POSTGRES_USER=taskboard \
     -e POSTGRES_PASSWORD=taskboard \
     -p 5433:5432 \
     postgres:17-alpine
   ```

2. Create `.env` from the example and set `JWT_SECRET`:

   ```sh
   cp .env.example .env
   ```

   `HOST`, `PORT` and `NODE_ENV` have defaults, the rest is required. The app refuses to start and names the offending variable otherwise.

3. Install, migrate, run:

   ```sh
   npm install
   npm run db:migrate
   npm run dev
   ```

   The API is served under `/api`, the interactive documentation at `http://localhost:8080/docs`. Sign in from the docs page once and the browser keeps the cookies for the following requests.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start with reload |
| `npm run build` | Compile to `dist/` without tests |
| `npm start` | Run the compiled build |
| `npm test` | Recreate the test database, run all `tests/*.test.ts` |
| `npm run typecheck` | `tsc --noEmit` over the whole tree, tests included |
| `npm run lint` / `npm run format` | Biome check, Biome check with fixes |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |

## Testing

`npm test` reads `DATABASE_URL`, derives `<database>_test` on the same server, drops and recreates it, applies the migrations from `drizzle/` and then runs every `tests/*.test.ts` file in its own process. Helpers in `src/core/testing` build the app against that database, sign up throwaway users and send requests as them:

```ts
const user = await signUpUser({ app });
const res = await requestAs({ app, user, method: "GET", url: api("/boards") });
```

The development database is never touched.

## Roadmap

- CI workflow: typecheck, lint and tests on every push
- Rate limiting on the auth routes, keyed by IP and email
- Proper TLS verification for the production database connection
