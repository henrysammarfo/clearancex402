import { fetchIpfsStatus } from "@/lib/storage/browser-ipfs-provider";

/** Pin JSON metadata via same-origin IPFS proxy (Vercel → VPS). */
export async function uploadJsonViaIpfsProxy(
  payload: unknown,
): Promise<{ cid: string; uri: string } | null> {
  const status = await fetchIpfsStatus();
  if (!status.available) return null;

  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const res = await fetch("/api/ipfs/pin", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: bytes,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `IPFS metadata pin failed (${res.status}).`);
  }
  const { cid } = (await res.json()) as { cid: string };
  const base = status.gatewayUrl?.replace(/\/+$/, "") ?? "https://w3s.link/ipfs";
  return { cid, uri: `${base}/${cid}` };
}
