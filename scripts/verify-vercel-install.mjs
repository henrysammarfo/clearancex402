#!/usr/bin/env node
/** Fail if package-lock still uses workspace: (breaks Vercel npm install). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lock = path.join(root, "package-lock.json");
const pkg = path.join(root, "package.json");

const lockText = fs.readFileSync(lock, "utf8");
const pkgJson = JSON.parse(fs.readFileSync(pkg, "utf8"));

const bad = [];
if (pkgJson.dependencies?.["@line-stack/cdr-core"]?.includes("workspace:")) {
  bad.push("package.json @line-stack/cdr-core uses workspace:");
}
if (pkgJson.dependencies?.["@cloudflare/vite-plugin"]) {
  bad.push("package.json still lists @cloudflare/vite-plugin (use Nitro vercel preset)");
}
if (pkgJson.devDependencies?.["@lovable.dev/vite-tanstack-config"]) {
  bad.push("package.json still lists @lovable.dev/vite-tanstack-config");
}
if (/\"@line-stack\/cdr-core\": \"workspace:\*\"/.test(lockText)) {
  bad.push("package-lock.json @line-stack/cdr-core uses workspace:*");
}

if (bad.length) {
  console.error("FAIL  Vercel install will break:\n  " + bad.join("\n  "));
  console.error("Use file:packages/cdr-core instead.");
  process.exit(1);
}

const viteConfig = fs.readFileSync(path.join(root, "vite.config.ts"), "utf8");
if (!/preset:\s*["']vercel["']/.test(viteConfig)) {
  console.error("FAIL  vite.config.ts must set nitro preset vercel for SSR deploy.");
  process.exit(1);
}

const vercelJson = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
if (vercelJson.outputDirectory !== ".vercel/output") {
  console.error("FAIL  vercel.json outputDirectory must be .vercel/output (not static SPA).");
  process.exit(1);
}
if (vercelJson.rewrites?.length) {
  console.error("FAIL  vercel.json must not use SPA rewrites — Nitro handles routing.");
  process.exit(1);
}

console.log("PASS  no workspace: protocol in root lockfile (Vercel-safe)");
console.log("PASS  nitro vercel preset configured");
