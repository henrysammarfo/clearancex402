#!/usr/bin/env node
/**
 * Beta gate: required env for CLI/SDK + optional web .env.local checks.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [k, v] of Object.entries(loadEnv("", root, ""))) {
  if (process.env[k] === undefined) process.env[k] = v;
}

const REQUIRED_CLI = [
  "WALLET_PRIVATE_KEY",
  "STORY_RPC_URL",
  "IPFS_PROXY_URL",
  "IPFS_PROXY_SECRET",
  "REGISTRY_API_URL",
  "REGISTRY_PROXY_SECRET",
  "LINESTACK_DATASET_REGISTRY",
  "LINESTACK_TEMPLATE_REGISTRY",
];

const OPTIONAL = ["STORACHA_PROOF", "LINESTACK_PUBLISHER_WRITE_CONDITION"];

function check(keys, label) {
  let fail = 0;
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (!v) {
      console.error(`FAIL  ${label}: missing ${key}`);
      fail++;
    } else {
      console.log(`PASS  ${key}`);
    }
  }
  return fail;
}

let failed = 0;
console.log("=== CLI / SDK / MCP env ===\n");
failed += check(REQUIRED_CLI, "required");

console.log("\n=== Optional ===\n");
for (const key of OPTIONAL) {
  const v = process.env[key]?.trim();
  console.log(v ? `PASS  ${key}` : `WARN  ${key} (optional)`);
}

console.log("\n=== Remote probes ===\n");
const secret = process.env.REGISTRY_PROXY_SECRET?.trim();
const regUrl = process.env.REGISTRY_API_URL?.trim().replace(/\/+$/, "");
const ipfsUrl = process.env.IPFS_PROXY_URL?.trim().replace(/\/+$/, "");

if (regUrl && secret) {
  try {
    const h = await fetch(`${regUrl}/health`, {
      headers: { authorization: `Bearer ${secret}` },
    });
    console.log(h.ok ? "PASS  registry health" : `FAIL  registry health ${h.status}`);
    if (!h.ok) failed++;
  } catch (e) {
    console.error("FAIL  registry health", e.message);
    failed++;
  }
}

if (ipfsUrl && secret) {
  try {
    const h = await fetch(`${ipfsUrl}/health`, {
      headers: { authorization: `Bearer ${secret}` },
    });
    console.log(h.ok ? "PASS  ipfs health" : `FAIL  ipfs health ${h.status}`);
    if (!h.ok) failed++;
  } catch (e) {
    console.error("FAIL  ipfs health", e.message);
    failed++;
  }
}

const deployed = path.join(root, "contracts", "deployed.aeneid.json");
if (fs.existsSync(deployed)) {
  console.log("\nPASS  contracts/deployed.aeneid.json present");
} else {
  console.log("\nWARN  contracts/deployed.aeneid.json missing");
}

process.exit(failed ? 1 : 0);
