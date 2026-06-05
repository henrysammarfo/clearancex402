const PROXY_URL = () => process.env.IPFS_PROXY_URL?.trim().replace(/\/+$/, "");
const PROXY_SECRET = () => process.env.IPFS_PROXY_SECRET?.trim();
const GATEWAY_URL = () =>
  process.env.IPFS_GATEWAY_URL?.trim().replace(/\/+$/, "") ??
  (PROXY_URL() ? `${PROXY_URL()!.replace(/:8787$/, "")}:8080/ipfs` : undefined);

export function isIpfsServerConfigured(): boolean {
  return Boolean(PROXY_URL() && PROXY_SECRET());
}

function authHeaders(): Record<string, string> {
  const secret = PROXY_SECRET();
  if (!secret) return {};
  return { authorization: `Bearer ${secret}` };
}

export async function pinBytesRemote(data: Uint8Array): Promise<string> {
  const base = PROXY_URL();
  if (!base || !PROXY_SECRET()) {
    throw new Error("IPFS_PROXY_URL and IPFS_PROXY_SECRET are not configured.");
  }
  const res = await fetch(`${base}/pin`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "content-type": "application/octet-stream",
    },
    body: data,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Remote IPFS pin failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { cid?: string };
  if (!json.cid) throw new Error("Remote IPFS pin response missing cid");
  return json.cid;
}

export async function getBytesRemote(cid: string): Promise<Uint8Array> {
  const base = PROXY_URL();
  if (!base || !PROXY_SECRET()) {
    throw new Error("IPFS_PROXY_URL and IPFS_PROXY_SECRET are not configured.");
  }
  const res = await fetch(`${base}/get/${encodeURIComponent(cid)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Remote IPFS get failed: ${res.status}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

export function publicGatewayUrl(cid: string): string | undefined {
  const gw = GATEWAY_URL();
  if (!gw) return undefined;
  return `${gw}/${cid}`;
}
