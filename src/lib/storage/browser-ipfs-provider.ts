import { ProxyStorageProvider } from "@line-stack/cdr-core";

let cached: ProxyStorageProvider | null = null;

/** Browser storage provider — pins via same-origin /api/ipfs routes. */
export async function createBrowserIpfsProvider(): Promise<ProxyStorageProvider> {
  if (cached) return cached;
  const status = await fetch("/api/ipfs/status");
  if (!status.ok) {
    throw new Error("IPFS storage is not available on this deployment.");
  }
  const body = (await status.json()) as { available?: boolean };
  if (!body.available) {
    throw new Error("IPFS storage is not configured (IPFS_PROXY_URL on server).");
  }
  cached = new ProxyStorageProvider({
    pinUrl: "/api/ipfs/pin",
    getUrl: (cid) => `/api/ipfs/get/${encodeURIComponent(cid)}`,
  });
  return cached;
}

export async function fetchIpfsStatus(): Promise<{
  available: boolean;
  gatewayUrl?: string;
  error?: string;
}> {
  try {
    const res = await fetch("/api/ipfs/status");
    return (await res.json()) as { available: boolean; gatewayUrl?: string; error?: string };
  } catch (e) {
    return {
      available: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
