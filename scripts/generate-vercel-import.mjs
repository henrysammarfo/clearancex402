#!/usr/bin/env node
/**
 * Writes vercel.import.env.tmp from .env.local + production defaults (Vercel dashboard → Import .env).
 * Excludes WALLET_PRIVATE_KEY and other local-only keys.
 * DELETE the file after import. Gitignored.
 *
 *   npm run vercel:import-env
 *   npm run vercel:import-cleanup   # after import
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, ".env.local");
const out = path.join(root, "vercel.import.env.tmp");
const deployedPath = path.join(root, "contracts", "deployed.aeneid.json");

const ALLOW = new Set([
  // Story (server + build-time public)
  "VITE_STORY_RPC_URL",
  "VITE_STORY_API_URL",
  "VITE_STORY_CHAIN_ID",
  "VITE_STORY_EXPLORER_TX_URL",
  "VITE_WALLETCONNECT_PROJECT_ID",
  "VITE_LINESTACK_DATASET_REGISTRY",
  "VITE_LINESTACK_TEMPLATE_REGISTRY",
  "VITE_APP_ENV",
  "STORY_RPC_URL",
  "STORY_API_URL",
  "STORY_NETWORK",
  "STORY_CHAIN_ID",
  "STORY_EXPLORER_TX_URL",
  // VPS IPFS + registry
  "IPFS_PROXY_URL",
  "IPFS_PROXY_SECRET",
  "IPFS_GATEWAY_URL",
  "REGISTRY_API_URL",
  "REGISTRY_PROXY_SECRET",
  // Storacha (server IP registration)
  "STORACHA_PRINCIPAL",
  "STORACHA_PROOF",
  // Line Stack contracts (server + optional client)
  "LINESTACK_DATASET_REGISTRY",
  "LINESTACK_TEMPLATE_REGISTRY",
  "LINESTACK_PUBLISHER_WRITE_CONDITION",
  "LINESTACK_BUYER_READ_CONDITION",
  "LINESTACK_MERKLE_ALLOWLIST_READ_CONDITION",
  // Automata DCAP (server / CLI parity; fixture ships in repo)
  "USE_AUTOMATA_DCAP_FIXTURE",
  "AUTOMATA_DCAP_QUOTE_FILE",
  "AUTOMATA_DCAP_QUOTE_HEX",
  // Tuning
  "CDR_TIMEOUT_MS",
  "LOG_LEVEL",
]);

const BLOCK = new Set([
  "WALLET_PRIVATE_KEY",
  "BUYER_WALLET_PRIVATE_KEY",
  "RUN_CDR_INTEGRATION",
  "ALCHEMY_API_KEY",
  "LINESTACK_ENV_FILE",
  "LINESTACK_STATE_FILE",
  "LINESTACK_BETA_MERKLE_ROOT",
]);

function parseEnvFile(filePath) {
  const vars = new Map();
  if (!fs.existsSync(filePath)) return vars;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars.set(key, value);
  }
  return vars;
}

function loadDeployed() {
  if (!fs.existsSync(deployedPath)) return {};
  return JSON.parse(fs.readFileSync(deployedPath, "utf8"));
}

const deployed = loadDeployed();
const defaults = {
  STORY_RPC_URL: "https://aeneid.storyrpc.io",
  STORY_API_URL: "http://172.192.41.96:1317",
  STORY_NETWORK: "testnet",
  STORY_CHAIN_ID: "1315",
  STORY_EXPLORER_TX_URL: "https://aeneid.storyscan.io/tx/",
  VITE_STORY_RPC_URL: "https://aeneid.storyrpc.io",
  // Leave unset: browser on HTTPS uses /api/story-api proxy (see resolveBrowserStoryApiUrl).
  VITE_STORY_API_URL: "",
  VITE_STORY_CHAIN_ID: "1315",
  VITE_STORY_EXPLORER_TX_URL: "https://aeneid.storyscan.io/tx/",
  VITE_APP_ENV: "production",
  CDR_TIMEOUT_MS: "120000",
  LOG_LEVEL: "info",
  USE_AUTOMATA_DCAP_FIXTURE: "1",
  AUTOMATA_DCAP_QUOTE_FILE: "fixtures/automata/alibaba-v5-quote.hex",
  LINESTACK_DATASET_REGISTRY: deployed.datasetRegistry ?? "",
  LINESTACK_TEMPLATE_REGISTRY: deployed.templateRegistry ?? "",
  LINESTACK_PUBLISHER_WRITE_CONDITION: deployed.publisherWriteCondition ?? "",
  LINESTACK_BUYER_READ_CONDITION: deployed.buyerReadCondition ?? "",
  LINESTACK_MERKLE_ALLOWLIST_READ_CONDITION: deployed.merkleAllowlistReadCondition ?? "",
  VITE_LINESTACK_DATASET_REGISTRY: deployed.datasetRegistry ?? "",
  VITE_LINESTACK_TEMPLATE_REGISTRY: deployed.templateRegistry ?? "",
};

if (!fs.existsSync(src)) {
  console.error("Missing .env.local — create it first (cp .env.example .env.local).");
  process.exit(1);
}

const local = parseEnvFile(src);
const vars = new Map();

for (const [key, value] of Object.entries(defaults)) {
  if (value) vars.set(key, value);
}

for (const [key, value] of local) {
  if (BLOCK.has(key)) continue;
  if (!ALLOW.has(key)) continue;
  if (value) vars.set(key, value);
}

// Mirror Story server → Vite when only server side is set
const mirror = [
  ["STORY_RPC_URL", "VITE_STORY_RPC_URL"],
  ["STORY_API_URL", "VITE_STORY_API_URL"],
  ["STORY_CHAIN_ID", "VITE_STORY_CHAIN_ID"],
  ["STORY_EXPLORER_TX_URL", "VITE_STORY_EXPLORER_TX_URL"],
  ["LINESTACK_DATASET_REGISTRY", "VITE_LINESTACK_DATASET_REGISTRY"],
  ["LINESTACK_TEMPLATE_REGISTRY", "VITE_LINESTACK_TEMPLATE_REGISTRY"],
];
for (const [from, to] of mirror) {
  const v = vars.get(from);
  if (!v || vars.get(to)) continue;
  // Do not bake http Story-API into the client bundle (mixed content on Vercel).
  if (from === "STORY_API_URL" && v.startsWith("http://")) continue;
  vars.set(to, v);
}

const REQUIRED = [
  "IPFS_PROXY_URL",
  "IPFS_PROXY_SECRET",
  "IPFS_GATEWAY_URL",
  "REGISTRY_API_URL",
  "REGISTRY_PROXY_SECRET",
  "STORACHA_PROOF",
  "STORACHA_PRINCIPAL",
  "VITE_WALLETCONNECT_PROJECT_ID",
  "VITE_LINESTACK_DATASET_REGISTRY",
  "VITE_LINESTACK_TEMPLATE_REGISTRY",
  "LINESTACK_DATASET_REGISTRY",
  "LINESTACK_TEMPLATE_REGISTRY",
  "USE_AUTOMATA_DCAP_FIXTURE",
];
const missing = REQUIRED.filter((k) => !vars.get(k)?.trim());

const automataQuoteReady =
  Boolean(vars.get("AUTOMATA_DCAP_QUOTE_HEX")?.trim()) ||
  (vars.get("USE_AUTOMATA_DCAP_FIXTURE") === "1" &&
    Boolean(vars.get("AUTOMATA_DCAP_QUOTE_FILE")?.trim() || defaults.AUTOMATA_DCAP_QUOTE_FILE));
if (!automataQuoteReady) {
  missing.push("AUTOMATA (USE_AUTOMATA_DCAP_FIXTURE=1 + quote file, or AUTOMATA_DCAP_QUOTE_HEX)");
}

const sections = [
  {
    title: "Public (VITE_ — embedded in browser bundle)",
    keys: [...vars.keys()].filter((k) => k.startsWith("VITE_")).sort(),
  },
  {
    title: "Server only (never VITE_ — IPFS, registry, Storacha, Automata)",
    keys: [...vars.keys()]
      .filter((k) => !k.startsWith("VITE_"))
      .sort(),
  },
];

const header = `# TEMPORARY — import into Vercel then DELETE (npm run vercel:import-cleanup)
# Vercel → Project → Settings → Environment Variables → Import .env
# Enable: Production (all keys below are required for live Line Stack)
#
# NOT included (by design):
#   WALLET_PRIVATE_KEY, BUYER_WALLET_PRIVATE_KEY, ALCHEMY_API_KEY, RUN_CDR_INTEGRATION
#
# After import + redeploy, smoke:
#   https://linestack.vercel.app/status
#   https://linestack.vercel.app/api/registry/status
#   https://linestack.vercel.app/api/ipfs/status
#
# Automata DCAP on fulfill is REQUIRED (fixture or AUTOMATA_DCAP_QUOTE_HEX).
# WalletConnect project id is REQUIRED (VITE_WALLETCONNECT_PROJECT_ID).
#
${missing.length ? `# ERROR — missing required keys in .env.local — fix before import:\n#   ${missing.join("\n#   ")}\n#\n` : "# All required production keys present.\n#\n"}`;

if (missing.length) {
  console.error(`Missing required production env in .env.local:\n  - ${missing.join("\n  - ")}`);
  process.exit(1);
}

const body = sections
  .flatMap(({ title, keys }) => {
    const lines = keys.filter((k) => vars.has(k)).map((k) => `${k}=${vars.get(k)}`);
    if (!lines.length) return [];
    return [`# --- ${title} ---`, ...lines, ""];
  })
  .join("\n");

fs.writeFileSync(out, `${header}${body}`, "utf8");
console.log(`Wrote ${out} (${vars.size} variables)`);
console.log("All required production env keys present.");
console.log("Import in Vercel, redeploy, then: npm run vercel:import-cleanup");
