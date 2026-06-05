#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const solPath =
  process.argv[2] ??
  path.join(root, ".tmp-automata/evm/forge-test/AutomataDcapOnChainAttestationTest.t.sol");
const sol = fs.readFileSync(solPath, "utf8");
const which = process.argv[3] || "v4";
const marker =
  which === "v3" ? "testQuoteV3OnChainAttestation" : "testTDXQuoteV4OnChainAttestation";
const outPath =
  which === "v3"
    ? path.join(root, "fixtures/automata/v3-sgx-quote.hex")
    : path.join(root, "fixtures/automata/v4-tdx-quote.hex");
const start = sol.indexOf(marker);
if (start < 0) throw new Error("testTDXQuoteV4OnChainAttestation not found");
const chunk = sol.slice(start);
const m = chunk.match(/sampleQuote\s*=\s*hex"([0-9a-fA-F]+)"/);
if (!m) throw new Error("sampleQuote hex not found");
const hex = `0x${m[1]}`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, hex, "utf8");
console.log(`Wrote ${outPath} (${(hex.length - 2) / 2} bytes)`);
