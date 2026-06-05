#!/usr/bin/env node
/**
 * Full Line Stack smoke: Vaultline + Queryline via @line-stack/sdk (two wallets).
 * Loads .env.local. Generates + funds buyer if BUYER_WALLET_PRIVATE_KEY unset.
 *
 *   node scripts/smoke-e2e-full.mjs
 *   node scripts/smoke-e2e-full.mjs --skip-vaultline
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { loadEnv } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [k, v] of Object.entries(loadEnv("", root, ""))) {
  if (process.env[k] === undefined) process.env[k] = v;
}

const skipVaultline = process.argv.includes("--skip-vaultline");
const withAutomata = process.argv.includes("--automata");
if (withAutomata) {
  process.env.USE_AUTOMATA_DCAP_FIXTURE = "1";
  process.env.RUN_AUTOMATA_DCAP = "1";
}
const tmpDir = path.join(os.tmpdir(), `linestack-smoke-${Date.now()}`);
fs.mkdirSync(tmpDir, { recursive: true });

function pass(label, detail = "") {
  console.log(`PASS  ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, err) {
  console.error(`FAIL  ${label}: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
function step(label) {
  console.log(`\n=== ${label} ===`);
}

async function fundBuyer(publisherKey, buyerAddress, rpcUrl) {
  const publisher = privateKeyToAccount(publisherKey);
  const publicClient = createPublicClient({ transport: http(rpcUrl) });
  const walletClient = createWalletClient({
    account: publisher,
    transport: http(rpcUrl),
  });
  const hash = await walletClient.sendTransaction({
    account: publisher,
    to: buyerAddress,
    value: parseEther("0.25"),
  });
  await publicClient.waitForTransactionReceipt({ hash });
  pass("fund buyer", `${buyerAddress} ← 0.25 IP (${hash.slice(0, 14)}…)`);
}

async function withPublisher(fn) {
  const key = process.env.WALLET_PRIVATE_KEY?.trim();
  if (!key) fail("env", "WALLET_PRIVATE_KEY required");
  process.env.WALLET_PRIVATE_KEY = key;
  const { loadLineStackEnv } = await import("../packages/sdk/dist/env/load-env.js");
  const { LineStack } = await import("../packages/sdk/dist/linestack.js");
  loadLineStackEnv(root);
  const ls = new LineStack();
  await ls.connect();
  return fn(ls);
}

async function withBuyer(fn) {
  let buyerKey = process.env.BUYER_WALLET_PRIVATE_KEY?.trim();
  if (!buyerKey) {
    buyerKey = generatePrivateKey();
    const buyer = privateKeyToAccount(buyerKey);
    const outPath = path.join(root, ".buyer-wallet.generated.json");
    fs.writeFileSync(
      outPath,
      JSON.stringify({ address: buyer.address, privateKey: buyerKey }, null, 2),
      { mode: 0o600 },
    );
    pass("generated buyer wallet", `${buyer.address} → ${outPath}`);
    const rpc = process.env.STORY_RPC_URL?.trim() || "https://aeneid.storyrpc.io";
    await fundBuyer(process.env.WALLET_PRIVATE_KEY, buyer.address, rpc);
    process.env.BUYER_WALLET_PRIVATE_KEY = buyerKey;
  }
  const saved = process.env.WALLET_PRIVATE_KEY;
  process.env.WALLET_PRIVATE_KEY = buyerKey;
  const { loadLineStackEnv } = await import("../packages/sdk/dist/env/load-env.js");
  const { LineStack } = await import("../packages/sdk/dist/linestack.js");
  loadLineStackEnv(root);
  const ls = new LineStack();
  await ls.connect();
  try {
    return await fn(ls);
  } finally {
    process.env.WALLET_PRIVATE_KEY = saved;
  }
}

step("preflight");
if (!process.env.REGISTRY_API_URL || !process.env.REGISTRY_PROXY_SECRET) {
  fail("registry", "REGISTRY_API_URL + REGISTRY_PROXY_SECRET required");
}
if (!process.env.WALLET_PRIVATE_KEY) fail("env", "WALLET_PRIVATE_KEY required");
pass("registry + publisher wallet configured");

step("build packages");
const { execSync } = await import("node:child_process");
execSync("npm run build:core && npm run build:sdk && npm run build:cli", {
  cwd: root,
  stdio: "inherit",
});

let listingId;
let fileCdrUuid;
let vaultUuid;

if (!skipVaultline) {
  step("Vaultline — publisher");
  await withPublisher(async (ls) => {
    const vault = await ls.vaultlineCreateVault(`smoke-vault-${Date.now()}`);
    vaultUuid = vault.vaultUuid;
    pass("create vault", vaultUuid);

    const secret = await ls.vaultlineWriteSecret(
      vault.cdrUuid,
      new TextEncoder().encode(JSON.stringify({ smoke: true, ts: Date.now() })),
    );
    pass("write secret", secret.txHash?.slice(0, 18) ?? "ok");

    if (!process.env.STORACHA_PROOF?.trim()) {
      console.log("SKIP  register-ip (STORACHA_PROOF not set)");
      return;
    }

    const reg = await ls.vaultlineRegisterIpAndListing({
      vaultUuid,
      title: `Smoke listing ${Date.now()}`,
      description: "E2E smoke",
      licenseTemplate: "non-commercial",
      priceIp: "0.01",
    });
    listingId = reg.listingId;
    pass("register IP + listing", listingId);
  });

  if (listingId) {
    step("Vaultline — buyer");
    await withBuyer(async (ls) => {
      const buy = await ls.vaultlineBuyLicense(listingId);
      pass("buy license", buy.licenseTokenId);
    });
    pass("vaultline buyer license", listingId);
  }
}

step("Queryline — publisher");
let datasetId;
let templateId;
let requestId;

await withPublisher(async (ls) => {
  const ds = await ls.querylineCreateDataset(`smoke-dataset-${Date.now()}`, "{}", "e2e");
  datasetId = ds.datasetId;
  pass("create dataset", datasetId);

  await ls.querylineSeedDataset(datasetId, {
    rows: [
      { region: "EU", value: 10 },
      { region: "EU", value: 20 },
      { region: "US", value: 5 },
    ],
  });
  pass("seed dataset");

  const tpl = await ls.querylineAddTemplate(datasetId, "avg_value_by_region", '{"region":"string"}');
  templateId = tpl.templateId;
  pass("add template", templateId);
});

step("Queryline — buyer request");
await withBuyer(async (ls) => {
  const req = await ls.querylineRequestQuery(datasetId, templateId, { region: "EU" });
  requestId = req.requestId;
  pass("request query", requestId);
});

step("Queryline — publisher fulfill (attested)");
await withPublisher(async (ls) => {
  const fulfilled = await ls.querylineFulfillRequest(requestId);
  const auto = fulfilled.attestation?.automata?.txHash;
  pass(
    "fulfill",
    `tx=${fulfilled.txHash.slice(0, 14)}… signer=${fulfilled.attestation.signer.slice(0, 10)}…${auto ? ` automata=${auto.slice(0, 14)}…` : ""}`,
  );
  if (!fulfilled.attestation.signature?.startsWith("0x")) {
    fail("attestation", "missing EIP-712 signature");
  }
  if (!auto) {
    fail(
      "automata",
      "missing attestation.automata.txHash — Automata DCAP is required (USE_AUTOMATA_DCAP_FIXTURE=1 or AUTOMATA_DCAP_QUOTE_HEX)",
    );
  }
});

step("Queryline — buyer unlock");
await withBuyer(async (ls) => {
  const unlocked = await ls.querylineUnlockResult(requestId);
  if (unlocked.data && typeof unlocked.data === "object") {
    pass("unlock result", JSON.stringify(unlocked.data).slice(0, 120));
  } else {
    fail("unlock", "empty result");
  }
});

step("SDK status");
await withPublisher(async (ls) => {
  const status = await ls.getStatus();
  pass("getStatus", `wallet=${status.wallet?.slice(0, 10)}… datasets=${status.datasetCount}`);
});

console.log("\n✓ smoke-e2e-full completed");
console.log(`  datasetId=${datasetId}`);
console.log(`  requestId=${requestId}`);
console.log(`  tmp=${tmpDir}`);
