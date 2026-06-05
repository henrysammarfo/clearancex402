/**
 * Pre-flight smoke: env schema + RPC + Story-API probes (no mocks).
 * Loads .env.local via vite loadEnv (same as integration tests).
 */
import { loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [k, v] of Object.entries(loadEnv("", root, ""))) {
  if (process.env[k] === undefined) process.env[k] = v;
}

const { loadConfigFromEnv } = await import("../packages/cdr-core/dist/env/schema.js");

async function probeRpc(rpcUrl) {
  const started = Date.now();
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  return { blockNumber: BigInt(json.result).toString(), latencyMs: Date.now() - started };
}

async function probeApi(apiUrl) {
  const started = Date.now();
  const base = apiUrl.replace(/\/$/, "");
  const res = await fetch(base);
  if (!res.ok && res.status >= 500) throw new Error(`HTTP ${res.status}`);
  return { status: res.status, latencyMs: Date.now() - started };
}

const checks = [];

try {
  const config = loadConfigFromEnv();
  checks.push({ name: "env schema", ok: true, detail: `chain ${config.chainId}, hasWallet=${Boolean(config.walletPrivateKey)}` });
} catch (e) {
  checks.push({ name: "env schema", ok: false, detail: e.message });
}

const rpcUrl = process.env.STORY_RPC_URL ?? process.env.VITE_STORY_RPC_URL;
const apiUrl = process.env.STORY_API_URL ?? process.env.VITE_STORY_API_URL;

if (rpcUrl) {
  try {
    const r = await probeRpc(rpcUrl);
    checks.push({ name: "Story RPC", ok: true, detail: `block ${r.blockNumber}, ${r.latencyMs}ms` });
  } catch (e) {
    checks.push({ name: "Story RPC", ok: false, detail: e.message });
  }
} else {
  checks.push({ name: "Story RPC", ok: false, detail: "STORY_RPC_URL missing" });
}

if (apiUrl) {
  try {
    const r = await probeApi(apiUrl);
    checks.push({ name: "Story-API", ok: true, detail: `HTTP ${r.status}, ${r.latencyMs}ms` });
  } catch (e) {
    checks.push({ name: "Story-API", ok: false, detail: e.message });
  }
} else {
  checks.push({ name: "Story-API", ok: false, detail: "STORY_API_URL missing" });
}

checks.push({
  name: "CDR integration gate",
  ok: process.env.RUN_CDR_INTEGRATION === "1" && Boolean(process.env.WALLET_PRIVATE_KEY),
  detail: `RUN_CDR_INTEGRATION=${process.env.RUN_CDR_INTEGRATION ?? "unset"}, wallet=${process.env.WALLET_PRIVATE_KEY ? "set" : "missing"}`,
});

const storachaOk =
  Boolean(process.env.STORACHA_PROOF?.trim()) &&
  Boolean(process.env.STORACHA_PRINCIPAL?.trim());
const ipfsOk =
  Boolean(process.env.IPFS_PROXY_URL?.trim()) &&
  Boolean(process.env.IPFS_PROXY_SECRET?.trim());
checks.push({
  name: "IPFS VPS",
  ok: ipfsOk,
  detail: ipfsOk
    ? `IPFS_PROXY_URL set (${process.env.IPFS_PROXY_URL})`
    : "required — set IPFS_PROXY_URL + IPFS_PROXY_SECRET",
});

checks.push({
  name: "Storacha server",
  ok: storachaOk,
  detail: storachaOk
    ? "STORACHA_PROOF + STORACHA_PRINCIPAL set"
    : "required — set both STORACHA_PROOF and STORACHA_PRINCIPAL",
});

const wcId =
  process.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() ||
  process.env.WALLETCONNECT_PROJECT_ID?.trim();
checks.push({
  name: "WalletConnect project id",
  ok: Boolean(wcId),
  detail: wcId ? `set (${wcId.slice(0, 8)}…)` : "required — VITE_WALLETCONNECT_PROJECT_ID",
});

const automataOk =
  Boolean(process.env.AUTOMATA_DCAP_QUOTE_HEX?.trim()) ||
  process.env.USE_AUTOMATA_DCAP_FIXTURE === "1";
checks.push({
  name: "Automata DCAP",
  ok: automataOk,
  detail: automataOk
    ? process.env.AUTOMATA_DCAP_QUOTE_HEX
      ? "AUTOMATA_DCAP_QUOTE_HEX set"
      : "USE_AUTOMATA_DCAP_FIXTURE=1"
    : "required — USE_AUTOMATA_DCAP_FIXTURE=1 or AUTOMATA_DCAP_QUOTE_HEX",
});

let failed = 0;
for (const c of checks) {
  const mark = c.ok ? "PASS" : "FAIL";
  if (!c.ok) failed++;
  console.log(`${mark}  ${c.name}: ${c.detail}`);
}
process.exit(failed > 0 ? 1 : 0);
