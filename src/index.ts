import "dotenv/config";
import { app } from "./app.js";
import { config } from "./config.js";
import { logger } from "./logger.js";

const server = app.listen(config.port, () => {
  logger.info(`listening on :${config.port} (${config.nodeEnv})`);
});

function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  server.close(() => {
    logger.info("server closed");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));