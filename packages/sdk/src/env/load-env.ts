import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * Load env files without overwriting variables already set in the process.
 * Order (first file wins per key only if key unset):
 * 1. LINESTACK_ENV_FILE (explicit path)
 * 2. cwd `.env.local` / `.env`
 * 3. `~/.linestack/.env`
 */
export function loadLineStackEnv(cwd = process.cwd()): void {
  const explicit = process.env.LINESTACK_ENV_FILE?.trim();
  if (explicit) {
    loadEnvFile(explicit);
    return;
  }

  for (const filePath of [
    path.join(cwd, ".env.local"),
    path.join(cwd, ".env"),
    path.join(os.homedir(), ".linestack", ".env"),
  ]) {
    loadEnvFile(filePath);
  }
}

function loadEnvFile(filePath: string): void {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (process.env[key] !== undefined) continue;
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    // missing file is fine
  }
}
