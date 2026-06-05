/**
 * Phase 3b checks: condition encoders + optional live allocate with license read.
 * Loads .env.local. Set STORY_TEST_IP_ID to run live license-condition allocate.
 */
import { loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodeAbiParameters } from "viem";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [k, v] of Object.entries(loadEnv("", root, ""))) {
  if (process.env[k] === undefined) process.env[k] = v;
}

const {
  encodeLicenseReadConditionData,
  encodeOwnerWriteConditionData,
  AENEID_CONDITION_CONTRACTS,
  loadConfigFromEnv,
  createLineStackCdrClient,
  initLineStackCdr,
} = await import("../packages/cdr-core/dist/index.js");

const owner = "0xB883e76A4f6841E72cAF1C28ba00f78df974f448";
const testIp = process.env.STORY_TEST_IP_ID ?? "0x0000000000000000000000000000000000000001";

const writeData = encodeOwnerWriteConditionData(owner);
const readData = encodeLicenseReadConditionData(testIp);
const [, ip] = decodeAbiParameters(
  [{ type: "address" }, { type: "address" }],
  readData,
);
if (ip.toLowerCase() !== testIp.toLowerCase()) {
  console.error("FAIL  encode read condition ip mismatch");
  process.exit(1);
}
console.log("PASS  encode write/read conditions");

if (process.env.RUN_CDR_INTEGRATION !== "1" || !process.env.WALLET_PRIVATE_KEY) {
  console.log("SKIP  live license allocate (set RUN_CDR_INTEGRATION=1 + wallet)");
  process.exit(0);
}

await initLineStackCdr();
const { client } = createLineStackCdrClient({ config: loadConfigFromEnv() });
const { uuid, txHash } = await client.uploader.allocate({
  updatable: false,
  writeConditionAddr: AENEID_CONDITION_CONTRACTS.ownerWrite,
  readConditionAddr: AENEID_CONDITION_CONTRACTS.licenseRead,
  writeConditionData: writeData,
  readConditionData: readData,
  skipConditionValidation: true,
});
console.log(`PASS  license-gated allocate uuid=${uuid} tx=${txHash.slice(0, 14)}…`);
