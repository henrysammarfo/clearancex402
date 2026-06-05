#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, createWalletClient, http } from "viem";
import { defineChain } from "viem";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [k, v] of Object.entries(loadEnv("", root, ""))) process.env[k] ??= v;

const { verifyAutomataDcapQuoteOnChain } = await import(
  "../packages/cdr-core/dist/attestation/dcap-onchain.js"
);

const key = process.env.WALLET_PRIVATE_KEY?.trim();
if (!key) throw new Error("WALLET_PRIVATE_KEY required");
const rpc = process.env.STORY_RPC_URL?.trim() || "https://aeneid.storyrpc.io";
const account = privateKeyToAccount(key);
const chain = defineChain({
  id: 1315,
  name: "Story Aeneid",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: { default: { http: [rpc] } },
});
const publicClient = createPublicClient({ chain, transport: http(rpc) });
const walletClient = createWalletClient({ account, chain, transport: http(rpc) });

const dir = path.join(root, "fixtures/automata");
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".hex"))) {
  const quote = fs.readFileSync(path.join(dir, file), "utf8").trim();
  const hex = quote.startsWith("0x") ? quote : `0x${quote}`;
  process.stdout.write(`try ${file} … `);
  try {
    const r = await verifyAutomataDcapQuoteOnChain({
      walletClient,
      publicClient,
      quote: hex,
    });
    console.log(`PASS tx=${r.txHash}`);
    process.exit(0);
  } catch (e) {
    console.log(`FAIL ${e.message?.slice(0, 80)}`);
  }
}
process.exit(1);
