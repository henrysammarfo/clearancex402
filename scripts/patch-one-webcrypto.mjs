#!/usr/bin/env node
/**
 * @ucanto/principal imports { webcrypto } from "one-webcrypto" (ESM → node.mjs).
 * Published node.mjs is empty; patch it to use Node's crypto.webcrypto.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shim = `import { webcrypto } from "node:crypto";
export { webcrypto };
`;

function patchDir(dir) {
  const target = path.join(dir, "node.mjs");
  if (!fs.existsSync(path.join(dir, "package.json"))) return false;
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  if (current === shim) return false;
  fs.writeFileSync(target, shim, "utf8");
  return true;
}

function walk(nmDir) {
  let n = 0;
  for (const name of ["one-webcrypto", path.join("@storacha", "one-webcrypto")]) {
    const dir = path.join(nmDir, name);
    if (patchDir(dir)) n++;
  }
  if (!fs.existsSync(nmDir)) return n;
  for (const ent of fs.readdirSync(nmDir, { withFileTypes: true })) {
    if (!ent.isDirectory() || ent.name === ".bin") continue;
    if (ent.name.startsWith("@")) {
      const scope = path.join(nmDir, ent.name);
      for (const sub of fs.readdirSync(scope, { withFileTypes: true })) {
        if (sub.isDirectory() && sub.name === "one-webcrypto") {
          if (patchDir(path.join(scope, sub.name))) n++;
        }
      }
    }
    if (ent.name === "one-webcrypto" && patchDir(path.join(nmDir, ent.name))) n++;
  }
  return n;
}

const patched = walk(path.join(root, "node_modules"));
if (patched > 0) {
  console.log(`patch-one-webcrypto: fixed ${patched} package(s)`);
}
