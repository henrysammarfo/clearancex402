/**
 * Smoke: VPS registry-api health + mutate roundtrip.
 */
import { loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [k, v] of Object.entries(loadEnv("", root, ""))) {
  if (process.env[k] === undefined) process.env[k] = v;
}

const base = process.env.REGISTRY_API_URL?.trim().replace(/\/+$/, "");
const secret =
  process.env.REGISTRY_PROXY_SECRET?.trim() || process.env.IPFS_PROXY_SECRET?.trim();
if (!base || !secret) {
  console.error("FAIL  REGISTRY_API_URL / REGISTRY_PROXY_SECRET not set");
  process.exit(1);
}

const headers = {
  authorization: `Bearer ${secret}`,
  "content-type": "application/json",
};

const health = await fetch(`${base}/health`, { headers });
if (!health.ok) {
  console.error(`FAIL  health: ${health.status}`);
  process.exit(1);
}
console.log("PASS  health");

const get0 = await fetch(`${base}/registry`, { headers });
if (!get0.ok) {
  console.error(`FAIL  registry get: ${get0.status}`);
  process.exit(1);
}
console.log("PASS  registry get");

const testVault = {
  uuid: `test-${Date.now()}`,
  name: "registry-smoke",
  owner: "0x0000000000000000000000000000000000000001",
  allocateTxHash: "0xsmoke",
  createdAt: new Date().toISOString(),
};

const mutate = await fetch(`${base}/mutate`, {
  method: "POST",
  headers,
  body: JSON.stringify({ op: "upsert", path: "vaultline.vaults", record: testVault }),
});
if (!mutate.ok) {
  console.error(`FAIL  mutate: ${mutate.status} ${await mutate.text()}`);
  process.exit(1);
}
const snap = await mutate.json();
const found = snap.vaultline?.vaults?.some((v) => v.uuid === testVault.uuid);
if (!found) {
  console.error("FAIL  vault not in snapshot after mutate");
  process.exit(1);
}
console.log("PASS  mutate upsert vault");

const del = await fetch(`${base}/mutate`, {
  method: "POST",
  headers,
  body: JSON.stringify({ op: "delete", path: "vaultline.vaults", id: testVault.uuid }),
});
if (!del.ok) {
  console.error(`FAIL  delete: ${del.status} ${await del.text()}`);
  process.exit(1);
}
const after = await del.json();
if (after.vaultline?.vaults?.some((v) => v.uuid === testVault.uuid)) {
  console.error("FAIL  vault still present after delete");
  process.exit(1);
}
console.log("PASS  mutate delete vault");
console.log(`PASS  revision=${after.revision ?? "n/a"}`);
