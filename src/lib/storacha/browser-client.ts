import * as Client from "@storacha/client";
import * as Proof from "@storacha/client/proof";
import { extract } from "@storacha/client/delegation";
import { StoreIndexedDB } from "@storacha/client/stores/indexeddb";
import { StorachaProvider } from "@line-stack/cdr-core";

const LOCAL_PROOF_KEY = "linestack.storacha.proof.v1";

export function getLocalStorachaProof(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LOCAL_PROOF_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function setLocalStorachaProof(proof: string | null): void {
  if (typeof window === "undefined") return;
  if (!proof?.trim()) {
    window.localStorage.removeItem(LOCAL_PROOF_KEY);
    return;
  }
  window.localStorage.setItem(LOCAL_PROOF_KEY, proof.trim());
}

async function configureClientFromProof(client: Client.Client, proofStr: string): Promise<void> {
  const proof = await Proof.parse(proofStr);
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());
}

async function configureClientFromDelegation(
  client: Client.Client,
  delegationBase64: string,
): Promise<void> {
  const bytes = Uint8Array.from(atob(delegationBase64), (c) => c.charCodeAt(0));
  const extracted = await extract(bytes);
  if (!extracted.ok) {
    throw new Error("Invalid Storacha delegation archive from server.");
  }
  // Space delegations must use addSpace (not addProof) — see Storacha UCAN docs.
  const space = await client.addSpace(extracted.ok);
  await client.setCurrentSpace(space.did());
}

/**
 * Build a CDR StorachaProvider for browser uploads.
 * Tries server delegation first, then local proof from Settings (dev/CLI).
 */
export async function createBrowserStorachaProvider(): Promise<StorachaProvider> {
  const client = await Client.create({ store: new StoreIndexedDB("linestack-storacha") });

  const localProof = getLocalStorachaProof();
  if (localProof) {
    await configureClientFromProof(client, localProof);
    return new StorachaProvider(client);
  }

  const res = await fetch("/api/storacha/delegation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentDid: client.did() }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(
      body.error ??
        "Storacha not configured. Add STORACHA_PROOF + STORACHA_PRINCIPAL on the server or paste a CLI proof in Settings.",
    );
  }

  const { delegationBase64 } = (await res.json()) as { delegationBase64: string };
  await configureClientFromDelegation(client, delegationBase64);
  return new StorachaProvider(client);
}

export async function uploadJsonToStoracha(
  provider: StorachaProvider,
  payload: unknown,
): Promise<{ cid: string; uri: string }> {
  const client = (provider as unknown as { client: Client.Client }).client;
  const json = JSON.stringify(payload);
  const blob = new Blob([json], { type: "application/json" });
  const cid = await client.uploadFile(blob);
  const cidStr = cid.toString();
  return { cid: cidStr, uri: `https://w3s.link/ipfs/${cidStr}` };
}

export async function checkStorachaAvailable(): Promise<{
  available: boolean;
  source?: "local" | "server";
  error?: string;
}> {
  if (getLocalStorachaProof()) {
    return { available: true, source: "local" };
  }
  try {
    const res = await fetch("/api/storacha/status");
    if (!res.ok) return { available: false, error: "Server status check failed." };
    const data = (await res.json()) as { configured: boolean };
    return data.configured
      ? { available: true, source: "server" }
      : {
          available: false,
          error: "STORACHA_PROOF + STORACHA_PRINCIPAL not set on server.",
        };
  } catch {
    return { available: false, error: "Could not reach Storacha status endpoint." };
  }
}
