import * as Client from "@storacha/client";
import * as Proof from "@storacha/client/proof";
import { StoreMemory } from "@storacha/client/stores/memory";
import { Verifier } from "@ucanto/principal";
import * as Signer from "@ucanto/principal/ed25519";

const UPLOAD_ABILITIES = [
  "space/blob/add",
  "space/index/add",
  "upload/add",
  "filecoin/offer",
] as const;

export function isStorachaServerConfigured(): boolean {
  return Boolean(
    process.env.STORACHA_PROOF?.trim() && process.env.STORACHA_PRINCIPAL?.trim(),
  );
}

export async function createUploadDelegation(agentDid: string): Promise<string> {
  const proofStr = process.env.STORACHA_PROOF?.trim();
  const principalStr = process.env.STORACHA_PRINCIPAL?.trim();
  if (!proofStr || !principalStr) {
    throw new Error("STORACHA_PROOF and STORACHA_PRINCIPAL must be configured on the server.");
  }

  const client = await Client.create({
    store: new StoreMemory(),
    principal: Signer.parse(principalStr),
  });
  const proof = await Proof.parse(proofStr);
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());

  const audience = Verifier.parse(agentDid as `did:${string}:${string}`);
  const expiration = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
  const delegation = await client.createDelegation(audience, [...UPLOAD_ABILITIES], {
    expiration,
  });

  const archive = await delegation.archive();
  if (!archive.ok) {
    throw new Error("Failed to archive Storacha delegation.");
  }

  const bytes =
    archive.ok instanceof Uint8Array
      ? archive.ok
      : new Uint8Array(archive.ok as ArrayBuffer);

  return Buffer.from(bytes).toString("base64");
}
