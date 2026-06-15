import type { ClearanceStore } from "@/lib/clearance/store-types";
import { GLOBAL_ACCOUNT, normalizeWallet } from "@/lib/clearance/account-wallet";
import {
  emptyAccountStore,
  loadAccountStore,
  saveAccountStore,
} from "@/lib/clearance/account-persist";

const cache = new Map<string, ClearanceStore>();

export async function withAccountStore<T>(
  wallet: string,
  fn: (store: ClearanceStore) => Promise<T> | T,
): Promise<T> {
  const key = normalizeWallet(wallet);
  let store = cache.get(key);
  if (!store) {
    store = await loadAccountStore(key);
    cache.set(key, store);
  }
  const result = await fn(store);
  cache.set(key, store);
  await saveAccountStore(key, store);
  return result;
}

export async function getStoreForWallet(wallet: string): Promise<ClearanceStore> {
  const key = normalizeWallet(wallet);
  if (!cache.has(key)) {
    cache.set(key, await loadAccountStore(key));
  }
  return cache.get(key)!;
}

export async function ensureStoreHydrated(wallet = GLOBAL_ACCOUNT): Promise<ClearanceStore> {
  return getStoreForWallet(wallet);
}

export function getClearanceStore(wallet = GLOBAL_ACCOUNT): ClearanceStore {
  const key = normalizeWallet(wallet);
  if (!cache.has(key)) {
    cache.set(key, emptyAccountStore());
  }
  return cache.get(key)!;
}

export async function flushAccount(wallet: string): Promise<void> {
  const key = normalizeWallet(wallet);
  const store = cache.get(key);
  if (store) await saveAccountStore(key, store);
}

export function invalidateAccountCache(wallet?: string): void {
  if (wallet) cache.delete(normalizeWallet(wallet));
  else cache.clear();
}

export async function appendAudit(
  wallet: string,
  event: Omit<import("@/lib/clearance/store-types").AuditEvent, "id" | "time">,
) {
  return withAccountStore(wallet, (store) => {
    const row = {
      ...event,
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      time: new Date().toISOString(),
    };
    store.audit.unshift(row);
    if (store.audit.length > 500) store.audit.length = 500;
    return row;
  });
}

export async function saveProbe(
  wallet: string,
  result: import("@/lib/clearance/store-types").ProbeResult,
) {
  return withAccountStore(wallet, (store) => {
    store.probes[result.toolId] = result;
  });
}

export function getProbe(wallet: string, toolId: string) {
  return getClearanceStore(wallet).probes[toolId];
}

export async function saveVeniceEval(
  wallet: string,
  result: import("@/lib/clearance/store-types").VeniceEvalResult,
) {
  return withAccountStore(wallet, (store) => {
    store.veniceEvals[result.toolId] = result;
  });
}

export function getVeniceEval(wallet: string, toolId: string) {
  return getClearanceStore(wallet).veniceEvals[toolId];
}

export function listPermissions(wallet: string, includeRevoked = false) {
  return getClearanceStore(wallet).permissions.filter((p) => includeRevoked || !p.revokedAt);
}

export function getPermission(wallet: string, id: string) {
  return getClearanceStore(wallet).permissions.find((p) => p.id === id);
}

export async function addPermission(
  wallet: string,
  grant: Omit<import("@/lib/clearance/store-types").PermissionGrant, "id" | "spentUsd">,
) {
  return withAccountStore(wallet, async (store) => {
    const row = { ...grant, id: `perm-${Date.now()}`, spentUsd: 0 };
    store.permissions.push(row);
    await appendAudit(wallet, {
      kind: "PERMISSION",
      tool: "—",
      actor: grant.userWallet,
      detail: `ERC-7715 granted ${grant.agentId} · session ${grant.sessionSmartAccount ?? "—"} · cap $${grant.maxPerCallUsd}`,
    });
    return row;
  });
}

export async function revokePermission(wallet: string, id: string) {
  return withAccountStore(wallet, async (store) => {
    const perm = store.permissions.find((p) => p.id === id);
    if (!perm || perm.revokedAt) return perm;
    perm.revokedAt = new Date().toISOString();
    await appendAudit(wallet, {
      kind: "REVOKE",
      tool: "—",
      actor: perm.userWallet,
      detail: `Revoked ${perm.agentId}`,
    });
    return perm;
  });
}

export async function recordSpend(wallet: string, permissionId: string, amountUsd: number) {
  return withAccountStore(wallet, (store) => {
    const perm = store.permissions.find((p) => p.id === permissionId);
    if (perm) perm.spentUsd += amountUsd;
  });
}

export async function updatePermission(
  wallet: string,
  id: string,
  patch: Partial<
    Pick<
      import("@/lib/clearance/store-types").PermissionGrant,
      "redelegatedContext" | "permissionContext"
    >
  >,
) {
  return withAccountStore(wallet, (store) => {
    const perm = store.permissions.find((p) => p.id === id);
    if (!perm) return undefined;
    Object.assign(perm, patch);
    return perm;
  });
}

export async function addRedelegation(
  wallet: string,
  record: Omit<import("@/lib/clearance/store-types").RedelegationRecord, "id" | "createdAt">,
) {
  return withAccountStore(wallet, async (store) => {
    const row = {
      ...record,
      id: `rd-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.redelegations.unshift(row);
    await appendAudit(wallet, {
      kind: "A2A",
      tool: "—",
      actor: record.childAgentId,
      detail: `Redelegated from ${record.parentAgentId} · cap $${record.narrowerCapUsd}`,
    });
    return row;
  });
}

export async function addCustomTool(
  wallet: string,
  tool: Omit<import("@/lib/clearance/store-types").RegisteredTool, "id" | "createdAt"> & {
    id?: string;
  },
) {
  const { slugifyId } = await import("@/lib/clearance/registry");
  return withAccountStore(wallet, async (store) => {
    const row = {
      ...tool,
      id: tool.id ?? slugifyId(tool.name),
      createdAt: new Date().toISOString(),
    };
    store.customTools.push(row);
    await appendAudit(wallet, {
      kind: "APPROVAL",
      tool: row.name,
      actor: wallet,
      detail: `Onboarded ${row.endpoint} · ${row.price}`,
    });
    return row;
  });
}

export async function saveAgentSession(
  wallet: string,
  params: {
    agentId: string;
    smartAccount: string;
    buyerEoa?: string;
    encryptedPrivateKey: string;
  },
) {
  return withAccountStore(wallet, (store) => {
    store.agentSessions[params.agentId] = {
      agentId: params.agentId,
      smartAccount: params.smartAccount,
      buyerEoa: params.buyerEoa,
      encryptedPrivateKey: params.encryptedPrivateKey,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function getAgentSession(wallet: string, agentId: string) {
  return getClearanceStore(wallet).agentSessions[agentId];
}

export type {
  AuditEvent,
  AuditKind,
  CheckDecision,
  ClearanceStore,
  PermissionGrant,
  ProbeResult,
  RedelegationRecord,
  RegisteredTool,
  VeniceEvalResult,
  AgentSessionRecord,
} from "@/lib/clearance/store-types";
