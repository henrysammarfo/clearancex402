#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const deployed = JSON.parse(
  fs.readFileSync(path.join(root, "contracts", "deployed.aeneid.json"), "utf8"),
);
const envPath = path.join(root, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local");
  process.exit(1);
}

const patch = {
  VITE_LINESTACK_DATASET_REGISTRY: deployed.datasetRegistry,
  VITE_LINESTACK_TEMPLATE_REGISTRY: deployed.templateRegistry,
  LINESTACK_DATASET_REGISTRY: deployed.datasetRegistry,
  LINESTACK_TEMPLATE_REGISTRY: deployed.templateRegistry,
  LINESTACK_PUBLISHER_WRITE_CONDITION: deployed.publisherWriteCondition,
  LINESTACK_BUYER_READ_CONDITION: deployed.buyerReadCondition,
  LINESTACK_MERKLE_ALLOWLIST_READ_CONDITION: deployed.merkleAllowlistReadCondition,
};

let lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
for (const [key, val] of Object.entries(patch)) {
  const re = new RegExp(`^${key}=`);
  const idx = lines.findIndex((l) => re.test(l));
  if (idx >= 0) lines[idx] = `${key}=${val}`;
  else lines.push(`${key}=${val}`);
}
fs.writeFileSync(envPath, lines.join("\n") + "\n", "utf8");
console.log("Patched .env.local with on-chain registry addresses.");
