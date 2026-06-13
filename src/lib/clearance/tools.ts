import type { ClearanceState } from "@/components/clearance/ClearanceBadge";
import { resolveDemoEndpoint } from "@/lib/clearance/x402-demo-handler";

export type ScoreKey =
  | "protocol"
  | "price"
  | "output"
  | "reliability"
  | "permission"
  | "relayer"
  | "drift"
  | "devReadiness";

export const SCORE_LABELS: Record<ScoreKey, string> = {
  protocol: "Protocol compliance",
  price: "Price integrity",
  output: "Output integrity",
  reliability: "Reliability",
  permission: "Permission safety",
  relayer: "Relayer readiness",
  drift: "Behavior drift",
  devReadiness: "Developer readiness",
};

export type Tool = {
  id: string;
  name: string;
  vendor: string;
  endpoint: string;
  protocol: "x402" | "MCP";
  category: string;
  price: string;
  network: string;
  state: ClearanceState;
  trust: number;
  latencyMs: number;
  uptime: number;
  lastProbe: string;
  description: string;
  scores: Record<ScoreKey, number>;
  simulateBlock?: boolean;
  /** HTTP method for live probes (default GET) */
  probeMethod?: "GET" | "POST";
  /** JSON body for POST probes */
  probeBody?: Record<string, unknown>;
  /** Venice /api/v1 route — probe uses API key for output when x402 pay is skipped */
  veniceApi?: boolean;
  /** Skip on-chain x402 pay (Venice x402 uses Base mainnet USDC) */
  skipX402Pay?: boolean;
};

export const TOOLS: Tool[] = [
  {
    id: "x402-sepolia-demo",
    name: "Clearance402 x402 Demo",
    vendor: "clearance402",
    endpoint: resolveDemoEndpoint(),
    protocol: "x402",
    category: "Demo",
    price: "$0.001 USDC / call",
    network: "Base Sepolia",
    state: "ALLOW",
    trust: 94,
    latencyMs: 280,
    uptime: 99.9,
    lastProbe: "—",
    description:
      "Free built-in x402 endpoint on Base Sepolia (x402.org facilitator). Full 402 → pay → response without Venice credits.",
    scores: {
      protocol: 98,
      price: 96,
      output: 92,
      reliability: 95,
      permission: 90,
      relayer: 88,
      drift: 97,
      devReadiness: 95,
    },
  },
  {
    id: "venice-chat",
    name: "Venice Chat (x402 / API)",
    vendor: "venice.ai",
    endpoint: "https://api.venice.ai/api/v1/chat/completions",
    protocol: "x402",
    category: "Inference",
    price: "$0.010 USDC / call",
    network: "Base (x402) · API key eval",
    state: "ALLOW",
    trust: 92,
    latencyMs: 520,
    uptime: 99.5,
    lastProbe: "—",
    description:
      "Venice /api/v1 chat completions. x402 wallet auth on Base mainnet; judges add VENICE_API_KEY for live eval. Heuristic fallback when no credits.",
    probeMethod: "POST",
    probeBody: {
      model: "venice-uncensored",
      messages: [{ role: "user", content: "Reply with one word: cleared" }],
      max_tokens: 16,
    },
    veniceApi: true,
    skipX402Pay: true,
    scores: {
      protocol: 95,
      price: 94,
      output: 93,
      reliability: 96,
      permission: 92,
      relayer: 90,
      drift: 98,
      devReadiness: 94,
    },
  },
  {
    id: "cheap-summarizer",
    name: "QuickSummary",
    vendor: "unknown",
    endpoint: "https://quicksummary.xyz/pay/summarize",
    protocol: "x402",
    category: "Inference",
    price: "$0.002 USDC / call",
    network: "Base Sepolia",
    state: "BLOCK",
    trust: 24,
    latencyMs: 60,
    uptime: 61.4,
    lastProbe: "—",
    description:
      "Advertised price does not match payment requirement; used to demo BLOCK without spending.",
    scores: {
      protocol: 40,
      price: 18,
      output: 12,
      reliability: 55,
      permission: 30,
      relayer: 20,
      drift: 22,
      devReadiness: 28,
    },
    simulateBlock: true,
  },
];

/** @deprecated Use venice-chat — kept for backwards-compatible tool IDs in saved data */
export const VENICE_LEGACY_ID = "venice-vision";

export function getToolById(id: string): Tool | undefined {
  if (id === VENICE_LEGACY_ID) {
    return TOOLS.find((t) => t.id === "venice-chat");
  }
  return TOOLS.find((t) => t.id === id);
}

export function getToolByEndpoint(endpoint: string): Tool | undefined {
  return TOOLS.find((t) => t.endpoint === endpoint);
}

export function parseUsd(price: string): number {
  const m = price.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

export function resolveToolEndpoint(endpoint: string, requestOrigin?: string): string {
  if (!requestOrigin) return endpoint;
  const origin = requestOrigin.replace(/\/$/, "");
  if (endpoint.includes("clearancex402.vercel.app") && /localhost|127\.0\.0\.1/.test(origin)) {
    return endpoint.replace("https://clearancex402.vercel.app", origin);
  }
  if (endpoint.includes("/api/demo/x402") && !endpoint.startsWith("http")) {
    return `${origin}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  }
  return endpoint;
}
