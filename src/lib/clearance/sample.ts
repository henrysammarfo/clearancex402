import type { ClearanceState } from "@/components/clearance/ClearanceBadge";

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
};

export const TOOLS: Tool[] = [
  {
    id: "venice-vision",
    name: "Venice Vision API",
    vendor: "venice.ai",
    endpoint: "https://api.venice.ai/x402/vision",
    protocol: "x402",
    category: "Inference",
    price: "$0.010 USDC / call",
    network: "Base Sepolia",
    state: "ALLOW",
    trust: 96,
    latencyMs: 412,
    uptime: 99.8,
    lastProbe: "2m ago",
    description:
      "Image understanding endpoint. Returns a real 402 challenge, settles payment, and output matches the declared schema.",
    scores: { protocol: 100, price: 98, output: 95, reliability: 97, permission: 94, relayer: 92, drift: 99, devReadiness: 90 },
  },
  {
    id: "geo-enrich",
    name: "GeoEnrich MCP",
    vendor: "atlas-labs",
    endpoint: "mcp://atlas-labs.dev/geo-enrich",
    protocol: "MCP",
    category: "Data",
    price: "$0.004 USDC / call",
    network: "Base Sepolia",
    state: "WARN",
    trust: 78,
    latencyMs: 1280,
    uptime: 97.1,
    lastProbe: "11m ago",
    description:
      "Geocoding + enrichment tool. Works correctly but latency is high and the listing is new with limited probe history.",
    scores: { protocol: 92, price: 88, output: 84, reliability: 71, permission: 80, relayer: 70, drift: 76, devReadiness: 74 },
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
    lastProbe: "1m ago",
    description:
      "Advertised price does not match the on-chain payment requirement, and returned output does not match the declared schema.",
    scores: { protocol: 40, price: 18, output: 12, reliability: 55, permission: 30, relayer: 20, drift: 22, devReadiness: 28 },
  },
  {
    id: "ticker-feed",
    name: "TickerFeed x402",
    vendor: "marketwire",
    endpoint: "https://marketwire.io/x402/ticker",
    protocol: "x402",
    category: "Data",
    price: "$0.001 USDC / call",
    network: "Base Sepolia",
    state: "RETEST",
    trust: 81,
    latencyMs: 240,
    uptime: 98.2,
    lastProbe: "3h ago",
    description:
      "Previously verified, but recent output changed shape. Probe is stale — re-run clearance before allowing payment.",
    scores: { protocol: 95, price: 90, output: 70, reliability: 88, permission: 86, relayer: 80, drift: 58, devReadiness: 82 },
  },
  {
    id: "research-agent",
    name: "DeepResearch Agent",
    vendor: "cortex.run",
    endpoint: "mcp://cortex.run/deep-research",
    protocol: "MCP",
    category: "Agent",
    price: "$0.250 USDC / run",
    network: "Base Sepolia",
    state: "HUMAN_APPROVAL_REQUIRED",
    trust: 88,
    latencyMs: 5400,
    uptime: 99.1,
    lastProbe: "18m ago",
    description:
      "Passes all checks, but per-run spend exceeds the agent mandate. Requires manual human approval before payment.",
    scores: { protocol: 96, price: 92, output: 90, reliability: 93, permission: 60, relayer: 88, drift: 91, devReadiness: 86 },
  },
  {
    id: "translate-pro",
    name: "TranslatePro",
    vendor: "lingua",
    endpoint: "https://lingua.dev/x402/translate",
    protocol: "x402",
    category: "Inference",
    price: "$0.003 USDC / call",
    network: "Base Sepolia",
    state: "ALLOW",
    trust: 93,
    latencyMs: 320,
    uptime: 99.5,
    lastProbe: "6m ago",
    description: "Translation endpoint with clean 402 flow, consistent output, and stable behavior across probes.",
    scores: { protocol: 99, price: 95, output: 94, reliability: 96, permission: 92, relayer: 90, drift: 95, devReadiness: 88 },
  },
];

export function getTool(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

export type AuditEvent = {
  id: string;
  time: string;
  kind: "PROBE" | "PAYMENT" | "BLOCK" | "APPROVAL" | "VENICE" | "PERMISSION" | "RELAY" | "REVOKE";
  tool: string;
  actor: string;
  detail: string;
};

export const AUDIT: AuditEvent[] = [
  { id: "a1", time: "2026-06-06 09:41:12", kind: "PROBE", tool: "Venice Vision API", actor: "verifier-agent", detail: "402 challenge confirmed · payment settled · output matched schema" },
  { id: "a2", time: "2026-06-06 09:40:58", kind: "PAYMENT", tool: "TranslatePro", actor: "buyer-agent", detail: "Cleared ALLOW → paid $0.003 USDC" },
  { id: "a3", time: "2026-06-06 09:39:30", kind: "BLOCK", tool: "QuickSummary", actor: "guardian-agent", detail: "Price mismatch + output mismatch → BLOCK" },
  { id: "a4", time: "2026-06-06 09:38:02", kind: "VENICE", tool: "GeoEnrich MCP", actor: "verifier-agent", detail: "Output-quality eval 0.84 · drift 0.12" },
  { id: "a5", time: "2026-06-06 09:35:47", kind: "APPROVAL", tool: "DeepResearch Agent", actor: "human", detail: "Spend $0.25 exceeds mandate → awaiting approval" },
  { id: "a6", time: "2026-06-06 09:31:19", kind: "PERMISSION", tool: "—", actor: "user", detail: "Granted buyer-agent $5.00 cap · expires 24h" },
  { id: "a7", time: "2026-06-06 09:28:04", kind: "RELAY", tool: "Venice Vision API", actor: "1shot", detail: "Relayed payment tx · status submitted" },
  { id: "a8", time: "2026-06-06 09:12:55", kind: "REVOKE", tool: "—", actor: "user", detail: "Revoked scout-agent permission" },
];
