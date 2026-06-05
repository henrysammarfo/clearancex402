import { loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const loaded = loadEnv("", repoRoot, "");
for (const [key, value] of Object.entries(loaded)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}
