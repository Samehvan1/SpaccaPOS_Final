import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

try {
  console.log("Generating migrations...");
  execSync("pnpm --filter @workspace/db exec drizzle-kit generate", { stdio: "inherit" });
  console.log("Success!");
} catch (error) {
  console.error("Migration generation failed:", error);
  process.exit(1);
}
