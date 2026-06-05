import type { RegistryMutate } from "@/lib/registry/mutate";
import type { RegistrySnapshot } from "@/lib/registry/snapshot";

const API_URL = () => process.env.REGISTRY_API_URL?.trim().replace(/\/+$/, "");
const API_SECRET = () =>
  process.env.REGISTRY_PROXY_SECRET?.trim() || process.env.IPFS_PROXY_SECRET?.trim();

export function isRegistryServerConfigured(): boolean {
  return Boolean(API_URL() && API_SECRET());
}

function authHeaders(): Record<string, string> {
  const secret = API_SECRET();
  if (!secret) return {};
  return { authorization: `Bearer ${secret}` };
}

export async function fetchRegistrySnapshotRemote(): Promise<RegistrySnapshot> {
  const base = API_URL();
  if (!base || !API_SECRET()) {
    throw new Error("REGISTRY_API_URL and REGISTRY_PROXY_SECRET are not configured.");
  }
  const res = await fetch(`${base}/registry`, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Registry fetch failed: ${res.status} ${text}`);
  }
  return (await res.json()) as RegistrySnapshot;
}

export async function mutateRegistryRemote(mutate: RegistryMutate): Promise<RegistrySnapshot> {
  const base = API_URL();
  if (!base || !API_SECRET()) {
    throw new Error("REGISTRY_API_URL and REGISTRY_PROXY_SECRET are not configured.");
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
