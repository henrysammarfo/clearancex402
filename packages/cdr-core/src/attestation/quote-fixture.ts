import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Hex } from "viem";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const FIXTURE_CANDIDATES = [
  "fixtures/automata/alibaba-v5-quote.hex",
  "fixtures/automata/v3-sgx-quote.hex",
  "fixtures/automata/v4-tdx-quote.hex",
];

const DEFAULT_FIXTURE = path.join(repoRoot, FIXTURE_CANDIDATES[0]);

/** Intel DCAP quote from Automata public fixtures (verified on Story Aeneid). */
export function loadAutomataV4TdxQuoteFixture(
  filePath: string = process.env.AUTOMATA_DCAP_QUOTE_FILE?.trim() || DEFAULT_FIXTURE,
): Hex {
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
  const raw = fs.readFileSync(resolved, "utf8").trim();
  const hex = raw.startsWith("0x") ? raw : `0x${raw}`;
  return hex as Hex;
}

export function resolveAutomataDcapQuote(): Hex | undefined {
  const fromEnv = process.env.AUTOMATA_DCAP_QUOTE_HEX?.trim();
  if (fromEnv) {
    return (fromEnv.startsWith("0x") ? fromEnv : `0x${fromEnv}`) as Hex;
  }
  const file = process.env.AUTOMATA_DCAP_QUOTE_FILE?.trim();
  if (file === "0" || file === "false") return undefined;
  if (process.env.USE_AUTOMATA_DCAP_FIXTURE === "1" || file) {
    if (file) return loadAutomataV4TdxQuoteFixture(file);
    for (const rel of FIXTURE_CANDIDATES) {
      const p = path.join(repoRoot, rel);
      if (fs.existsSync(p)) return loadAutomataV4TdxQuoteFixture(p);
    }
  }
  return undefined;
}

export function parseAutomataQuoteFromEnv(): Hex | undefined {
  return resolveAutomataDcapQuote();
}
