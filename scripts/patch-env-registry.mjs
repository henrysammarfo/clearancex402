#!/usr/bin/env node
/**
 * Add REGISTRY_API_URL + REGISTRY_PROXY_SECRET to .env.local (from IPFS vars if present).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
const host = process.argv[2] ?? "64.176.181.71";

if (!fs.existsSync(envPath)) {
  console.error("No .env.local — copy from .env.example first.");
  process.exit(1);
}

let text = fs.readFileSync(envPath, "utf8");
const lines = text.split(/\r?\n/);

function get(key) {
  const hit = lines.find((l) => l.startsWith(`${key}=`));
  return hit?.slice(key.length + 1).trim();
}

const secret = get("REGISTRY_PROXY_SECRET") || get("IPFS_PROXY_SECRET");
if (!secret) {
  console.error("Set IPFS_PROXY_SECRET in .env.local first.");
  process.exit(1);
}

const set = (key, value) => {
  const i = lines.findIndex((l) => l.startsWith(`${key}=`));
  const row = `${key}=${value}`;
  if (i >= 0) lines[i] = row;
  else lines.push(row);
};

set("REGISTRY_API_URL", `http://${host}:8788`);
set("REGISTRY_PROXY_SECRET", secret);

fs.writeFileSync(envPath, lines.filter((l, i, a) => l !== "" || i < a.length - 1).join("\n") + "\n");
console.log(`Patched ${envPath}: REGISTRY_API_URL=http://${host}:8788`);
