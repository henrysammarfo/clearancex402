import type { RegistryMutate } from "@/lib/registry/mutate";
import { bootstrapRegistryFromCache, readRegistryCache, writeRegistryCache } from "@/lib/registry/cache";
import { EMPTY_REGISTRY_SNAPSHOT, type RegistrySnapshot } from "@/lib/registry/snapshot";
import { QUERYLINE_REGISTRY_EVENT, VAULTLINE_REGISTRY_EVENT } from "@/lib/registry/events";

let snapshot: RegistrySnapshot | null =
  typeof window !== "undefined" ? readRegistryCache() : null;
let loadPromise: Promise<RegistrySnapshot> | null = null;
const MIGRATE_KEY = "linestack.registry.migrated.v1";

export function getRegistrySnapshot(): RegistrySnapshot {
  return snapshot ?? EMPTY_REGISTRY_SNAPSHOT;
}

export function isRegistryHydrated(): boolean {
  return snapshot !== null;
}

function notifyAll() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(VAULTLINE_REGISTRY_EVENT));
  window.dispatchEvent(new Event(QUERYLINE_REGISTRY_EVENT));
}

export async function refreshRegistrySnapshot(): Promise<RegistrySnapshot> {
  const res = await fetch("/api/registry");
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Registry fetch failed (${res.status})`);
  }
  snapshot = (await res.json()) as RegistrySnapshot;
  writeRegistryCache(snapshot);
  notifyAll();
  return snapshot;
}

export async function ensureRegistryLoaded(): Promise<RegistrySnapshot> {
  if (snapshot) return snapshot;
  if (!loadPromise) {
    loadPromise = refreshRegistrySnapshot()
      .then(async (s) => {
        await migrateLocalStorageOnce(s);
        return getRegistrySnapshot();
      })
      .finally(() => {
        loadPromise = null;
      });
  }
  return loadPromise;
}

export async function registryMutate(mutate: RegistryMutate): Promise<RegistrySnapshot> {
  const res = await fetch("/api/registry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(mutate),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Registry mutate failed (${res.status})`);
  }
  snapshot = (await res.json()) as RegistrySnapshot;
  writeRegistryCache(snapshot);
  notifyAll();
  return snapshot;
}

export function hasRegistryCacheOnDisk(): boolean {
  return bootstrapRegistryFromCache();
}

function readLegacyJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

async function migrateLocalStorageOnce(current: RegistrySnapshot): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(MIGRATE_KEY)) return;

  const hasRemote =
    current.vaultline.vaults.length > 0 ||
    current.vaultline.listings.length > 0 ||
    current.queryline.datasets.length > 0 ||
    current.queryline.requests.length > 0 ||
    current.buyerLicenses.length > 0;

  const vaults = readLegacyJson("linestack.vaultline.vaults.v1");
  const files = readLegacyJson("linestack.vaultline.files.v1");
  const unlocks = readLegacyJson("linestack.vaultline.unlocks.v1");
  const ipAssets = readLegacyJson("linestack.vaultline.ip-assets.v1");
  const listings = readLegacyJson("linestack.vaultline.listings.v1");
  const vaultAudit = readLegacyJson("linestack.vaultline.audit.v1");
  const datasets = readLegacyJson("linestack.queryline.datasets.v1");
  const templates = readLegacyJson("linestack.queryline.templates.v1");
  const requests = readLegacyJson("linestack.queryline.requests.v1");
  const queryAudit = readLegacyJson("linestack.audit.queryline.v1");
  const buyerLicenses = readLegacyJson("linestack.vaultline.buyer-licenses.v1");

  const hasLocal =
    vaults.length > 0 ||
    files.length > 0 ||
    listings.length > 0 ||
    datasets.length > 0 ||
    requests.length > 0 ||
    buyerLicenses.length > 0;

  if (hasRemote || !hasLocal) {
    window.localStorage.setItem(MIGRATE_KEY, "1");
    return;
  }

  const mutates: RegistryMutate[] = [];
  for (const record of vaults) mutates.push({ op: "upsert", path: "vaultline.vaults", record });
  for (const record of files) mutates.push({ op: "upsert", path: "vaultline.files", record });
  for (const record of unlocks) mutates.push({ op: "upsert", path: "vaultline.unlocks", record });
  for (const record of ipAssets) mutates.push({ op: "upsert", path: "vaultline.ipAssets", record });
  for (const record of listings) mutates.push({ op: "upsert", path: "vaultline.listings", record });
  for (const record of vaultAudit) mutates.push({ op: "append", path: "vaultline.audit", record });
  for (const record of datasets) mutates.push({ op: "upsert", path: "queryline.datasets", record });
  for (const record of templates) mutates.push({ op: "upsert", path: "queryline.templates", record });
  for (const record of requests) mutates.push({ op: "upsert", path: "queryline.requests", record });
  for (const record of queryAudit) mutates.push({ op: "append", path: "queryline.audit", record });
  for (const record of buyerLicenses) mutates.push({ op: "upsert", path: "buyerLicenses", record });

  for (const mutate of mutates) {
    await registryMutate(mutate);
  }
  window.localStorage.setItem(MIGRATE_KEY, "1");
}
