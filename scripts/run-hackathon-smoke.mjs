/**
 * Pre-deadline smoke: registry VPS + production URLs (no wallet).
 * Run: npm run hackathon:smoke
 */
import { loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [k, v] of Object.entries(loadEnv("", root, ""))) {
  if (process.env[k] === undefined) process.env[k] = v;
}

const APP = (process.env.SMOKE_APP_URL ?? "https://linestack.vercel.app").replace(/\/+$/, "");

function runNode(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, "scripts", script)], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${script} exit ${code}`))));
  });
}

async function checkUrl(pathname, expectStatus = 200) {
  const url = `${APP}${pathname}`;
  const res = await fetch(url, { redirect: "follow" });
  if (res.status !== expectStatus) {
    throw new Error(`${pathname} → ${res.status} (expected ${expectStatus})`);
  }
  console.log(`PASS  ${pathname}`);
}

console.log("=== Line Stack hackathon smoke ===\n");

await runNode("test-registry-api.mjs");

const pages = [
  "/",
  "/status",
  "/architecture",
  "/vaultline/dashboard",
  "/vaultline/vaults",
  "/vaultline/listings",
  "/queryline/dashboard",
  "/api/registry/status",
];

for (const p of pages) {
  await checkUrl(p);
}

console.log("\nOK  hackathon smoke passed");
