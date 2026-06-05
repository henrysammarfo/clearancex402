#!/usr/bin/env node
/**
 * Build beta tester merkle root from addresses file (one 0x… per line).
 * Usage: node scripts/generate-beta-merkle.mjs testers.txt
 */
import fs from "node:fs";
import { encodeAbiParameters, keccak256 } from "viem";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/generate-beta-merkle.mjs <addresses.txt>");
  process.exit(1);
}

const addresses = fs
  .readFileSync(file, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => /^0x[a-fA-F0-9]{40}$/.test(l));

if (addresses.length === 0) {
  console.error("No valid addresses in file.");
  process.exit(1);
}

function leaf(addr) {
  return keccak256(encodeAbiParameters([{ type: "address" }], [addr]));
}

function hashPair(a, b) {
  const [left, right] = a <= b ? [a, b] : [b, a];
  return keccak256(
    encodeAbiParameters([{ type: "bytes32" }, { type: "bytes32" }], [left, right]),
  );
}

function buildRoot(leaves) {
  let layer = [...leaves].sort();
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      next.push(i + 1 < layer.length ? hashPair(layer[i], layer[i + 1]) : layer[i]);
    }
    layer = next;
  }
  return layer[0];
}

const leaves = addresses.map(leaf);
const root = buildRoot(leaves);

console.log(`Testers: ${addresses.length}`);
console.log(`LINESTACK_BETA_MERKLE_ROOT=${root}`);
console.log("\nPer-address leaves (store for proof generation in app):");

const out = { root, leaves: {} };
for (let i = 0; i < addresses.length; i++) {
  out.leaves[addresses[i]] = leaves[i];
}
fs.writeFileSync("beta-merkle.json", JSON.stringify(out, null, 2));
console.log("Wrote beta-merkle.json");
