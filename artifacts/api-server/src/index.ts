import "./env";
import path from "path";
import { fileURLToPath } from "url";

import app from "./app";
import { logger } from "./lib/logger";
import { seedIfEmpty } from "./lib/seed";

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

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  seedIfEmpty()
    .then(async () => {
      const { db, ingredientTypeVolumesTable } = await import("@workspace/db");
      await db.update(ingredientTypeVolumesTable).set({ isActive: true });
      logger.info("Auto-migration: All ingredient volumes activated.");
    })
    .catch((e) => logger.error({ err: e }, "Seed or migration failed"));
});
