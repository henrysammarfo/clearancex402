import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fixtureRaw from "../../../fixtures/automata/alibaba-v5-quote.hex?raw";

const DEFAULT_FIXTURE = "fixtures/automata/alibaba-v5-quote.hex";

function bundledFixtureHex(): string {
  const raw = fixtureRaw.trim();
  return raw.startsWith("0x") ? raw : `0x${raw}`;
}

function resolveFixturePath(rel: string): string | null {
  const fileName = path.basename(rel);
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel),
    path.join(process.cwd(), "automata-quotes", fileName),
    path.join(moduleDir, "automata-quotes", fileName),
    path.join(moduleDir, "../../../automata-quotes", fileName),
    path.join(moduleDir, "../../../../automata-quotes", fileName),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function loadQuoteHex(): { quote?: string; source?: string } {
  const fromEnv = process.env.AUTOMATA_DCAP_QUOTE_HEX?.trim();
  if (fromEnv) {
    const hex = fromEnv.startsWith("0x") ? fromEnv : `0x${fromEnv}`;
    return { quote: hex, source: "AUTOMATA_DCAP_QUOTE_HEX" };
  }

  const onVercel = Boolean(process.env.VERCEL);
  const useFixture =
    process.env.USE_AUTOMATA_DCAP_FIXTURE === "1" ||
    (process.env.USE_AUTOMATA_DCAP_FIXTURE !== "0" &&
      (onVercel || process.env.NODE_ENV === "production"));
  if (!useFixture) {
    return {};
  }

  const rel = process.env.AUTOMATA_DCAP_QUOTE_FILE?.trim() || DEFAULT_FIXTURE;
  const file = resolveFixturePath(rel);
  if (file) {
    const raw = fs.readFileSync(file, "utf8").trim();
    const hex = raw.startsWith("0x") ? raw : `0x${raw}`;
    return { quote: hex, source: rel };
  }

  return { quote: bundledFixtureHex(), source: "bundled:alibaba-v5-quote.hex" };
}

export function getServerAutomataQuote(): {
  enabled: boolean;
  quote?: string;
  source?: string;
} {
  const { quote, source } = loadQuoteHex();
  if (!quote) {
    return {
      enabled: false,
    };
  }
  return { enabled: true, quote, source };
}
