import { getClientEnv } from "@/lib/env/client";
import { jsonStringify } from "@/lib/json-safe";

export type ClearanceFetchInit = RequestInit & {
  wallet?: string | null;
  json?: unknown;
};

function apiBase(): string {
  const { clearanceApiUrl } = getClientEnv();
  return clearanceApiUrl.replace(/\/$/, "");
}

export function clearanceHeaders(wallet?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (wallet) headers["x-clearance-wallet"] = wallet.toLowerCase();
  return headers;
}

export async function clearanceFetch<T = unknown>(
  path: string,
  init: ClearanceFetchInit = {},
): Promise<T> {
  const { wallet, json, headers: extraHeaders, ...rest } = init;
  const headers = new Headers(clearanceHeaders(wallet));
  if (extraHeaders) {
    const h = new Headers(extraHeaders);
    h.forEach((v, k) => headers.set(k, v));
  }
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${apiBase()}${path}`, {
    ...rest,
    headers,
    body: json !== undefined ? jsonStringify(json) : rest.body,
  });
  const data = (await res.json().catch(() => ({}))) as T & {
    error?: string;
    decision?: { reasons?: string[]; state?: string };
    payResult?: { responsePreview?: string; httpStatus?: number };
  };
  if (!res.ok) {
    const reasons = data.decision?.reasons?.filter(Boolean);
    const preview = data.payResult?.responsePreview?.trim();
    const message =
      data.error ??
      (preview ? `x402 failed: ${preview.slice(0, 160)}` : null) ??
      (reasons && reasons.length > 0 ? reasons.join(" · ") : null) ??
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export type AccountSnapshot = {
  wallet: string;
  audit: import("@/lib/clearance/store-types").AuditEvent[];
  permissions: import("@/lib/clearance/store-types").PermissionGrant[];
  probes: import("@/lib/clearance/store-types").ProbeResult[];
  veniceEvals: import("@/lib/clearance/store-types").VeniceEvalResult[];
  redelegations: import("@/lib/clearance/store-types").RedelegationRecord[];
  customTools: import("@/lib/clearance/store-types").RegisteredTool[];
  agentSessions: { agentId: string; smartAccount: string; buyerEoa?: string; updatedAt: string }[];
};

export type DashboardPayload = {
  wallet: string;
  stats: {
    verifiedTools: number;
    blockedPayments: number;
    avgTrust: number;
    activeProbes: number;
  };
  recentTools: import("@/lib/clearance/live-types").EnrichedTool[];
  recentActivity: import("@/lib/clearance/store-types").AuditEvent[];
};

export const clearanceApi = {
  account: (wallet: string) =>
    clearanceFetch<AccountSnapshot>("/api/clearance/account", { wallet }),
  dashboard: (wallet: string) =>
    clearanceFetch<DashboardPayload>("/api/clearance/account?dashboard=1", { wallet }),
  tools: (wallet: string) =>
    clearanceFetch<{ tools: import("@/lib/clearance/live-types").EnrichedTool[] }>(
      "/api/clearance/tools",
      { wallet },
    ),
  tool: (wallet: string, id: string) =>
    clearanceFetch<{ tool: import("@/lib/clearance/live-types").EnrichedTool }>(
      `/api/clearance/tools?id=${encodeURIComponent(id)}`,
      { wallet },
    ),
  audit: (wallet: string) => clearanceFetch("/api/clearance/audit", { wallet }),
  permissions: (wallet: string) => clearanceFetch("/api/clearance/permissions", { wallet }),
  probe: (wallet: string, body: Record<string, unknown>) =>
    clearanceFetch("/api/clearance/probe", { wallet, method: "POST", json: body }),
  check: (wallet: string, body: Record<string, unknown>) =>
    clearanceFetch("/api/clearance/check", { wallet, method: "POST", json: body }),
  pay: (wallet: string, body: Record<string, unknown>) =>
    clearanceFetch("/api/clearance/pay", { wallet, method: "POST", json: body }),
  session: (wallet: string, body: Record<string, unknown>) =>
    clearanceFetch("/api/clearance/session", { wallet, method: "POST", json: body }),
  savePermission: (wallet: string, body: Record<string, unknown>) =>
    clearanceFetch("/api/clearance/permissions", { wallet, method: "POST", json: body }),
  revokePermission: (wallet: string, id: string) =>
    clearanceFetch(`/api/clearance/permissions?id=${encodeURIComponent(id)}`, {
      wallet,
      method: "DELETE",
    }),
  patchPermission: (wallet: string, body: Record<string, unknown>) =>
    clearanceFetch("/api/clearance/permissions", { wallet, method: "PATCH", json: body }),
  onboardTool: (wallet: string, body: Record<string, unknown>) =>
    clearanceFetch("/api/clearance/tools", { wallet, method: "POST", json: body }),
  veniceEval: (wallet: string, body: Record<string, unknown>) =>
    clearanceFetch("/api/clearance/venice-eval", { wallet, method: "POST", json: body }),
  a2a: (wallet: string, body: Record<string, unknown>) =>
    clearanceFetch("/api/clearance/a2a", { wallet, method: "POST", json: body }),
};
