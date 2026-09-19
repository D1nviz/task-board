import { buildApp } from "./app.js";

try {
  process.loadEnvFile();
} catch {
  // no .env file, rely on process environment
}

const app = buildApp();

async function start() {
  try {
    await app.ready();

    await app.listen({
      port: app.config.PORT,
      host: app.config.HOST,
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
