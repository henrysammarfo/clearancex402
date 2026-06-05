import { GatewayProvider, ProxyStorageProvider } from "@line-stack/cdr-core";

/** IPFS via remote proxy (VPS) when env is set. */
export function createStorageFromEnv() {
  const proxyUrl = process.env.IPFS_PROXY_URL?.trim().replace(/\/+$/, "");
  const secret = process.env.IPFS_PROXY_SECRET?.trim();
  if (proxyUrl && secret) {
    return new ProxyStorageProvider({
      pinUrl: `${proxyUrl}/pin`,
      getUrl: (cid) => `${proxyUrl}/get/${encodeURIComponent(cid)}`,
      headers: () => ({ authorization: `Bearer ${secret}` }),
    });
  }

  const apiUrl = process.env.IPFS_API_URL?.trim();
  const gatewayUrl = process.env.IPFS_GATEWAY_URL?.trim();
  if (apiUrl && gatewayUrl) {
    return new GatewayProvider({ apiUrl, gatewayUrl });
  }

  return null;
}
