#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const pkgDir = process.argv[2];
if (!pkgDir) {
  console.error("Usage: node scripts/verify-npm-package.mjs packages/<name>");
  process.exit(1);
}

const pkgPath = path.join(pkgDir, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
let failed = false;

function fail(msg) {
  console.error(`FAIL ${pkg.name}: ${msg}`);
  failed = true;
}

if (pkg.private) fail("package must not be private");
if (!pkg.name?.startsWith("@line-stack/")) fail("name must be @line-stack/*");

const deps = { ...pkg.dependencies, ...pkg.optionalDependencies };
for (const [name, spec] of Object.entries(deps ?? {})) {
  if (typeof spec === "string" && (spec.startsWith("file:") || spec.startsWith("link:"))) {
    fail(`dependency ${name} uses ${spec} — use workspace:* or semver for publish`);
  }
}

const files = pkg.files ?? [];
if (!files.includes("dist")) fail('package.json "files" must include "dist"');

const dist = path.join(pkgDir, "dist");
if (!fs.existsSync(dist)) fail("dist/ missing — run npm run build first");

const forbidden = [".env", ".env.local", "WALLET_PRIVATE_KEY"];
for (const f of forbidden) {
  if (fs.existsSync(path.join(pkgDir, f))) fail(`must not ship ${f}`);
}

if (!failed) console.log(`OK ${pkg.name}@${pkg.version}`);
process.exit(failed ? 1 : 0);
