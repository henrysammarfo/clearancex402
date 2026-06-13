import type { ClearanceState } from "@/components/clearance/ClearanceBadge";
import type { ScoreKey, Tool } from "@/lib/clearance/tools";
import { SCORE_LABELS, TOOLS as BUILTIN_TOOLS, parseUsd, getToolById, VENICE_LEGACY_ID } from "@/lib/clearance/tools";
import type { ProbeResult, VeniceEvalResult } from "@/lib/clearance/store-types";
import type { EnrichedTool, LiveStatusCheck } from "@/lib/clearance/live-types";
import { ensureStoreHydrated, getClearanceStore } from "@/lib/clearance/store";
import { normalizeWallet } from "@/lib/clearance/account-wallet";

export type { EnrichedTool, LiveStatusCheck } from "@/lib/clearance/live-types";

export type ToolDefinition = {
  id: string;
  name: string;
  vendor: string;
  endpoint: string;
  protocol: "x402" | "MCP";
  category: string;
  price: string;
  network: string;
  description: string;
  expectedSchema?: string;
  simulateBlock?: boolean;
  builtin?: boolean;
  createdAt?: string;
};

export { SCORE_LABELS, type ScoreKey };

export async function listToolDefinitions(wallet: string): Promise<ToolDefinition[]> {
  const key = normalizeWallet(wallet);
  await ensureStoreHydrated(key);
  const custom = getClearanceStore(key).customTools ?? [];
  return [
    ...BUILTIN_TOOLS.map((t) => ({
      id: t.id,
      name: t.name,
      vendor: t.vendor,
      endpoint: t.endpoint,
      protocol: t.protocol,
      category: t.category,
      price: t.price,
      network: t.network,
      description: t.description,
      simulateBlock: t.simulateBlock,
      builtin: true,
    })),
    ...custom,
  ];
}

export async function getToolDefinition(
  id: string,
  wallet: string,
): Promise<ToolDefinition | undefined> {
  const resolvedId = id === VENICE_LEGACY_ID ? "venice-chat" : id;
  const all = await listToolDefinitions(wallet);
  return all.find((t) => t.id === resolvedId || t.id === id);
}

export async function getToolByEndpoint(
  endpoint: string,
  wallet: string,
): Promise<ToolDefinition | undefined> {
  const all = await listToolDefinitions(wallet);
  return all.find((t) => t.endpoint === endpoint);
}

export async function listEnrichedTools(wallet: string): Promise<EnrichedTool[]> {
  const key = normalizeWallet(wallet);
  await ensureStoreHydrated(key);
  const store = getClearanceStore(key);
  const defs = await listToolDefinitions(key);
  return defs.map((def) =>
    enrichToolDefinition(def, store.probes[def.id], store.veniceEvals[def.id]),
  );
}

export async function getEnrichedTool(
  id: string,
  wallet: string,
): Promise<EnrichedTool | undefined> {
  const key = normalizeWallet(wallet);
  await ensureStoreHydrated(key);
  const def = await getToolDefinition(id, key);
  if (!def) return undefined;
  const store = getClearanceStore(key);
  return enrichToolDefinition(def, store.probes[id], store.veniceEvals[id]);
}

export function enrichToolDefinition(
  def: ToolDefinition,
  probe?: ProbeResult,
  venice?: VeniceEvalResult,
): EnrichedTool {
  const builtin = getToolById(def.id);
  const trust = computeTrust(def, probe, venice, builtin?.trust);
  const state = computeState(def, probe, venice, trust);
  const latencyMs = probe?.latencyMs ?? builtin?.latencyMs ?? 0;
  const lastProbe = probe?.finishedAt
    ? new Date(probe.finishedAt).toLocaleString()
    : "—";
  const uptime = probe
    ? probe.paymentValid && probe.responseValid
      ? 99.5
      : probe.challengeValid
        ? 85
        : 40
    : (builtin?.uptime ?? 0);

  const scores = buildScores(def, probe, venice, builtin?.scores);

  return {
    id: def.id,
    name: def.name,
    vendor: def.vendor,
    endpoint: def.endpoint,
    protocol: def.protocol,
    category: def.category,
    price: def.price,
    network: def.network,
    description: def.description,
    state,
    trust,
    latencyMs,
    uptime,
    lastProbe,
    scores,
    simulateBlock: def.simulateBlock,
    expectedSchema: def.expectedSchema,
    builtin: def.builtin,
    createdAt: def.createdAt,
    probe: probe ?? null,
    venice: venice ?? null,
    checks: buildChecks(
      { state, uptime, latencyMs, lastProbe, scores },
      probe,
      venice,
    ),
  };
}

function computeTrust(
  def: ToolDefinition,
  probe?: ProbeResult,
  venice?: VeniceEvalResult,
  fallback = 50,
): number {
  if (def.simulateBlock) return 24;
  if (!probe) return fallback > 0 ? fallback : 50;
  let score = 55;
  if (probe.challengeValid) score += 15;
  if (probe.paymentValid) score += 15;
  if (probe.responseValid) score += 10;
  if (venice) score += Math.round(venice.qualityScore / 10);
  if (venice?.riskLabel === "high") score -= 25;
  if (venice?.riskLabel === "medium") score -= 10;
  return Math.max(10, Math.min(99, score));
}

function computeState(
  def: ToolDefinition,
  probe?: ProbeResult,
  venice?: VeniceEvalResult,
  trust = 50,
): ClearanceState {
  if (def.simulateBlock) return "BLOCK";
  if (!probe) return "RETEST";
  if (probe.error || !probe.paymentValid) return "BLOCK";
  if (venice?.riskLabel === "high") return "BLOCK";
  if (venice && venice.driftScore > 0.25) return "WARN";
  if (trust >= 70) return "ALLOW";
  if (trust >= 45) return "WARN";
  return "BLOCK";
}

function buildScores(
  def: ToolDefinition,
  probe?: ProbeResult,
  venice?: VeniceEvalResult,
  builtinScores?: Record<ScoreKey, number>,
): Record<ScoreKey, number> {
  const base = builtinScores ?? {
    protocol: 70,
    price: 70,
    output: 70,
    reliability: 70,
    permission: 80,
    relayer: 75,
    drift: 80,
    devReadiness: def.builtin ? 85 : 60,
  };

  if (!probe) return base;

  return {
    protocol: probe.challengeValid ? 95 : 35,
    price: def.simulateBlock ? 18 : probe.paymentValid ? 92 : 45,
    output: probe.responseValid ? (venice ? venice.qualityScore : 88) : 25,
    reliability: probe.paymentValid ? 90 : 50,
    permission: base.permission,
    relayer: base.relayer,
    drift: venice ? Math.round((1 - venice.driftScore) * 100) : base.drift,
    devReadiness: def.builtin ? base.devReadiness : probe.paymentValid ? 75 : 40,
  };
}

function scoreState(score: number): ClearanceState {
  if (score >= 90) return "ALLOW";
  if (score >= 70) return "WARN";
  return "BLOCK";
}

export function buildChecks(
  tool: Pick<Tool, "state" | "uptime" | "latencyMs" | "lastProbe" | "scores">,
  probe?: ProbeResult,
  venice?: VeniceEvalResult,
): LiveStatusCheck[] {
  return [
    {
      label: "Endpoint health",
      detail: probe
        ? `HTTP ${probe.httpStatus} · ${probe.latencyMs}ms · last probe ${tool.lastProbe}`
        : `No probe yet · last probe ${tool.lastProbe}`,
      state: !probe ? "RETEST" : probe.paymentValid ? "ALLOW" : probe.challengeValid ? "WARN" : "BLOCK",
    },
    {
      label: "402 challenge",
      detail: probe?.challengeValid
        ? "Valid payment challenge returned"
        : probe
          ? "Missing or invalid 402 challenge"
          : "Run a probe to verify",
      state: !probe ? "RETEST" : probe.challengeValid ? "ALLOW" : "BLOCK",
    },
    {
      label: "x402 settlement",
      detail: probe?.paymentValid
        ? "Payment settled on Base Sepolia"
        : probe
          ? probe.error ?? "Payment failed"
          : "Run a probe to verify",
      state: !probe ? "RETEST" : probe.paymentValid ? "ALLOW" : "BLOCK",
    },
    {
      label: "Output integrity",
      detail: venice
        ? `Venice quality ${venice.qualityScore} · ${venice.summary}`
        : probe?.responseValid
          ? "Response received after payment"
          : "Awaiting Venice eval or probe output",
      state: venice
        ? venice.riskLabel === "high"
          ? "BLOCK"
          : venice.qualityScore >= 70
            ? "ALLOW"
            : "WARN"
        : !probe
          ? "RETEST"
          : probe.responseValid
            ? "WARN"
            : "BLOCK",
    },
    {
      label: "Price integrity",
      detail: `Advertised ${tool.scores.price >= 70 ? "matches" : "may not match"} on-chain requirement`,
      state: scoreState(tool.scores.price),
    },
    {
      label: "Behavior drift",
      detail: venice
        ? `Drift score ${venice.driftScore.toFixed(2)}`
        : "Stable after first probe",
      state: venice && venice.driftScore > 0.25 ? "WARN" : scoreState(tool.scores.drift),
    },
  ];
}

export function slugifyId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "tool"}-${Date.now().toString(36)}`;
}

export async function getDashboardData(wallet: string) {
  const key = normalizeWallet(wallet);
  await ensureStoreHydrated(key);
  const store = getClearanceStore(key);
  const tools = await listEnrichedTools(key);
  const allow = tools.filter((t) => t.state === "ALLOW").length;
  const blockedAudit = store.audit.filter((e) => e.kind === "BLOCK").length;
  const avgTrust =
    tools.length > 0 ? Math.round(tools.reduce((s, t) => s + t.trust, 0) / tools.length) : 0;
  const activeProbes = Object.keys(store.probes).length;

  return {
    stats: {
      verifiedTools: allow,
      blockedPayments: blockedAudit,
      avgTrust,
      activeProbes,
    },
    recentTools: tools.slice(0, 6),
    recentActivity: store.audit.slice(0, 8),
  };
}

/** Sync lookup for server routes that already hydrated — builtin + custom */
export function getToolByIdSync(id: string, wallet: string): ToolDefinition | undefined {
  const key = normalizeWallet(wallet);
  const resolvedId = id === VENICE_LEGACY_ID ? "venice-chat" : id;
  const builtin = getToolById(resolvedId) ?? getToolById(id);
  if (builtin) {
    return {
      id: builtin.id,
      name: builtin.name,
      vendor: builtin.vendor,
      endpoint: builtin.endpoint,
      protocol: builtin.protocol,
      category: builtin.category,
      price: builtin.price,
      network: builtin.network,
      description: builtin.description,
      simulateBlock: builtin.simulateBlock,
      builtin: true,
    };
  }
  const custom = getClearanceStore(key).customTools?.find((t) => t.id === id);
  return custom;
}

export { parseUsd };
