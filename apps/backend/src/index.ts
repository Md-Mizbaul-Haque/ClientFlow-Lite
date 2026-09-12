import "dotenv/config";

import { app } from "./app.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
  logger.info("server_listening", { port: env.PORT, env: env.NODE_ENV });
});

// Platforms send SIGTERM before killing the container. Stop accepting
// connections, let in-flight requests finish, then drop the DB pool.
function shutdown(signal: NodeJS.Signals): void {
  logger.info("server_shutdown_started", { signal });
  server.close((err) => {
    if (err) {
      logger.error("server_shutdown_failed", { message: err.message });
      process.exitCode = 1;
    }
    void prisma.$disconnect().finally(() => process.exit());
  });
  // Don't hang forever on a stuck connection.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// A process in an unknown state must not keep serving traffic. Log the cause and
// let the platform restart us — silent continuation is how data gets corrupted.
process.on("unhandledRejection", (reason) => {
  logger.error("unhandled_rejection", { message: reason instanceof Error ? reason.message : String(reason) });
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  logger.error("uncaught_exception", { message: error.message, stack: error.stack });
  process.exit(1);
});

export default app;
