import "./config/env.js";
import app from "./app";
import { logger } from "./lib/logger";
import { autoMigrate } from "./lib/autoMigrate.js";
import { initDatabase } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Choose how to reach the database (direct Postgres, or HTTPS when the host
// blocks Postgres ports), then bring the schema up to date before accepting
// traffic, so a missing column can never crash the app.
const dbConnection = await initDatabase();
logger.info(dbConnection, "Database transport selected");
await autoMigrate();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
