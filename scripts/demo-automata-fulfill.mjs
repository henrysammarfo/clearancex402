#!/usr/bin/env node
/**
 * Demo: Queryline fulfill with Automata DCAP on-chain attestation on Story Aeneid.
 * Uses fixtures/automata/v4-tdx-quote.hex unless AUTOMATA_DCAP_QUOTE_HEX is set.
 *
 *   node scripts/demo-automata-fulfill.mjs
 *   USE_AUTOMATA_DCAP_FIXTURE=1 node scripts/smoke-e2e-full.mjs --skip-vaultline
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [k, v] of Object.entries(loadEnv("", root, ""))) {
  if (process.env[k] === undefined) process.env[k] = v;
}

if (!process.env.AUTOMATA_DCAP_QUOTE_HEX?.trim()) {
  process.env.USE_AUTOMATA_DCAP_FIXTURE = "1";
}

const { loadLineStackEnv } = await import("../packages/sdk/dist/env/load-env.js");
const { LineStack } = await import("../packages/sdk/dist/linestack.js");
const { verifyAutomataDcapQuoteOnChain } = await import(
  "../packages/cdr-core/dist/attestation/dcap-onchain.js"
);
const { AENEID_AUTOMATA_DCAP } = await import(
  "../packages/cdr-core/dist/attestation/aeneid-automata.js"
);
const { resolveAutomataDcapQuote } = await import(
  "../packages/cdr-core/dist/attestation/quote-fixture.js"
);

loadLineStackEnv(root);

const quote = resolveAutomataDcapQuote();
if (!quote) {
  console.error("FAIL  No DCAP quote (set AUTOMATA_DCAP_QUOTE_HEX or USE_AUTOMATA_DCAP_FIXTURE=1)");
  process.exit(1);
}
console.log(`PASS  quote loaded (${(quote.length - 2) / 2} bytes)`);

const { privateKeyToAccount } = await import("viem/accounts");
const { createPublicClient, createWalletClient, http } = await import("viem");
const { defineChain } = await import("viem");

const key = process.env.WALLET_PRIVATE_KEY?.trim();
if (!key) {
  console.error("FAIL  WALLET_PRIVATE_KEY required");
  process.exit(1);
}
const rpc = process.env.STORY_RPC_URL?.trim() || "https://aeneid.storyrpc.io";
const account2 = privateKeyToAccount(key);
const chain = defineChain({
  id: 1315,
  name: "Story Aeneid",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: { default: { http: [rpc] } },
});
const publicClient = createPublicClient({ chain, transport: http(rpc) });
const walletClient = createWalletClient({ account: account2, chain, transport: http(rpc) });

console.log("\n=== Automata on-chain verify (Aeneid) ===");
const automata = await verifyAutomataDcapQuoteOnChain({
  walletClient,
  publicClient,
  quote,
});
console.log(`PASS  Automata DCAP success=${automata.success}`);
console.log(`      tx https://aeneid.storyscan.io/tx/${automata.txHash}`);
console.log(`      contract ${AENEID_AUTOMATA_DCAP.AutomataDcapAttestationFee}`);

console.log("\n=== Queryline fulfill with Automata attestation ===");
process.env.USE_AUTOMATA_DCAP_FIXTURE = "1";

const ls = new LineStack();
await ls.connect();

const dataset = await ls.querylineCreateDataset(`automata-demo-${Date.now()}`, "{}", "dcap-demo");
await ls.querylineSeedDataset(dataset.datasetId, {
  rows: [
    { region: "EU", value: 12 },
    { region: "EU", value: 18 },
  ],
});
const tpl = await ls.querylineAddTemplate(dataset.datasetId, "avg_value_by_region", '{"region":"string"}');

const { generatePrivateKey, privateKeyToAccount: pkToAccount } = await import("viem/accounts");
const { parseEther } = await import("viem");
let buyerKey = process.env.BUYER_WALLET_PRIVATE_KEY?.trim();
if (!buyerKey) {
  buyerKey = generatePrivateKey();
}
const buyerAccount = pkToAccount(buyerKey);
const pub = createPublicClient({ chain, transport: http(rpc) });
const bal = await pub.getBalance({ address: buyerAccount.address });
if (bal < parseEther("0.05")) {
  const pubW = createWalletClient({ account: account2, chain, transport: http(rpc) });
  const fundHash = await pubW.sendTransaction({
    account: account2,
    to: buyerAccount.address,
    value: parseEther("0.25"),
  });
  await pub.waitForTransactionReceipt({ hash: fundHash });
  console.log(`PASS  funded buyer ${buyerAccount.address}`);
}
const saved = process.env.WALLET_PRIVATE_KEY;
process.env.WALLET_PRIVATE_KEY = buyerKey;
const buyerLs = new LineStack();
await buyerLs.connect();
const req = await buyerLs.querylineRequestQuery(dataset.datasetId, tpl.templateId, { region: "EU" });
process.env.WALLET_PRIVATE_KEY = saved;

await ls.connect();
const fulfilled = await ls.querylineFulfillRequest(req.requestId);
const autoTx = fulfilled.attestation?.automata?.txHash;
if (!autoTx) {
  console.error("FAIL  fulfill missing attestation.automata.txHash");
  process.exit(1);
}

const out = {
  requestId: req.requestId,
  datasetId: dataset.datasetId,
  fulfillTx: fulfilled.txHash,
  automataTx: autoTx,
  resultsUrl: `https://linestack.vercel.app/queryline/results/${req.requestId}`,
  explorerAutomata: `https://aeneid.storyscan.io/tx/${autoTx}`,
};
const outPath = path.join(root, ".automata-demo-last.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log("\n✓ demo-automata-fulfill completed");
console.log(JSON.stringify(out, null, 2));
console.log(`\nSaved ${outPath} — open resultsUrl as buyer after connect to see Automata DCAP tx row.`);
