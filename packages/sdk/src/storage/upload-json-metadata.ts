import { createStorageFromEnv } from "./ipfs-env.js";

function metadataUri(cid: string): string {
  const gateway = process.env.IPFS_GATEWAY_URL?.trim().replace(/\/+$/, "");
  if (gateway) return `${gateway}/${cid}`;
  return `https://w3s.link/ipfs/${cid}`;
}

/** Pin JSON metadata via IPFS proxy/gateway env (no Storacha / UCANTO). */
export async function uploadJsonMetadata(
  payload: unknown,
): Promise<{ cid: string; uri: string } | null> {
  const storage = createStorageFromEnv();
  if (!storage) return null;
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const cid = await storage.upload(bytes);
  return { cid, uri: metadataUri(cid) };
}
