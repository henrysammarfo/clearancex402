import { EMPTY_REGISTRY_SNAPSHOT, type RegistrySnapshot } from "@/lib/registry/snapshot";

const CACHE_KEY = "linestack.registry.snapshot.v1";

export function readRegistryCache(): RegistrySnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RegistrySnapshot;
    if (!parsed?.vaultline || !parsed?.queryline) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeRegistryCache(snapshot: RegistrySnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    /* quota / private mode */
  }
}

export function bootstrapRegistryFromCache(): boolean {
  const cached = readRegistryCache();
  if (!cached) return false;
  return (
    cached.vaultline.vaults.length > 0 ||
    cached.vaultline.listings.length > 0 ||
    cached.vaultline.files.length > 0 ||
    cached.queryline.datasets.length > 0 ||
    cached.queryline.requests.length > 0
  );
}

export function emptyRegistrySnapshot(): RegistrySnapshot {
  return EMPTY_REGISTRY_SNAPSHOT;
}
