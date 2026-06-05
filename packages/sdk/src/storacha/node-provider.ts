import * as Client from "@storacha/client";
import * as Proof from "@storacha/client/proof";
import { StoreMemory } from "@storacha/client/stores/memory";
import { StorachaProvider } from "@line-stack/cdr-core";

export async function createNodeStorachaProvider(): Promise<StorachaProvider> {
  const proofStr = process.env.STORACHA_PROOF?.trim();
  if (!proofStr) {
    throw new Error("STORACHA_PROOF is required for IP registration (see docs/STORACHA-CLI.md).");
  }
  const client = await Client.create({ store: new StoreMemory() });
  const proof = await Proof.parse(proofStr);
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());
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
