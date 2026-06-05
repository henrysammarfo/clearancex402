import type { RegistryMutate } from "./mutate.js";
import { EMPTY_REGISTRY_SNAPSHOT, type RegistrySnapshot } from "./types.js";

const apiUrl = () => process.env.REGISTRY_API_URL?.trim().replace(/\/+$/, "");
const apiSecret = () =>
  process.env.REGISTRY_PROXY_SECRET?.trim() || process.env.IPFS_PROXY_SECRET?.trim();

export function isRegistryConfigured(): boolean {
  return Boolean(apiUrl() && apiSecret());
}

function authHeaders(): Record<string, string> {
  const secret = apiSecret();
  if (!secret) return {};
  return { authorization: `Bearer ${secret}` };
}

export async function fetchRegistrySnapshot(): Promise<RegistrySnapshot> {
  const base = apiUrl();
  if (!base || !apiSecret()) {
    throw new Error("REGISTRY_API_URL and REGISTRY_PROXY_SECRET (or IPFS_PROXY_SECRET) are required.");
  }
  const res = await fetch(`${base}/registry`, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Registry fetch failed: ${res.status} ${text}`);
  }
  return (await res.json()) as RegistrySnapshot;
}

export async function registryMutate(mutate: RegistryMutate): Promise<RegistrySnapshot> {
  const base = apiUrl();
  if (!base || !apiSecret()) {
    throw new Error("REGISTRY_API_URL and REGISTRY_PROXY_SECRET are required.");
  }
  const res = await fetch(`${base}/mutate`, {
    method: "POST",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: JSON.stringify(mutate),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Registry mutate failed: ${res.status} ${text}`);
  }
  return (await res.json()) as RegistrySnapshot;
}

export async function fetchRegistrySnapshotOrEmpty(): Promise<RegistrySnapshot> {
  if (!isRegistryConfigured()) return structuredClone(EMPTY_REGISTRY_SNAPSHOT);
  return fetchRegistrySnapshot();
}
