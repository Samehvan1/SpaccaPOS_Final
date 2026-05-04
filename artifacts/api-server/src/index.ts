import "./env";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { exec } from "child_process";

import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "@workspace/db";
import { seedIfEmpty } from "./lib/seed";
import { syncPermissions } from "./lib/permissions-seed";
import stockAuditsRouter from "./routes/stock-audits";
import rolesRouter from "./routes/roles";

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

// Ensure migrations and permissions sync run before server starts accepting requests
runMigrations()
  .then(() => seedIfEmpty())
  .then(() => syncPermissions())
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
      setupAutoBackup();
    });
  })
  .catch((e) => {
    logger.error({ err: e }, "Critical startup error: Migration or Seed failed");
    process.exit(1);
  });


function setupAutoBackup() {
  const performBackup = () => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return;

    const backupsDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);

    const filename = `autobackup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
    const filePath = path.join(backupsDir, filename);
    const cmd = `pg_dump "${dbUrl}" -f "${filePath}"`;

    exec(cmd, (error) => {
      if (error) {
        logger.error({ err: error }, "Auto-backup failed");
      } else {
        logger.info({ filename }, "Auto-backup created");
        
        // Cleanup old backups (keep last 7 days)
        const files = fs.readdirSync(backupsDir);
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        files.forEach(file => {
          const stats = fs.statSync(path.join(backupsDir, file));
          if (now - stats.mtimeMs > maxAge) {
            fs.unlinkSync(path.join(backupsDir, file));
          }
        });
      }
    });
  };

  // Run once on startup
  performBackup();
  // Then every 24 hours
  setInterval(performBackup, 24 * 60 * 60 * 1000);
}
