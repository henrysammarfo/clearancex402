/**
 * Verifies STORACHA_PROOF + STORACHA_PRINCIPAL can mint a browser upload delegation.
 */
import { loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as Client from "@storacha/client";
import * as Proof from "@storacha/client/proof";
import { StoreMemory } from "@storacha/client/stores/memory";
import * as Signer from "@ucanto/principal/ed25519";
import { generate } from "@ucanto/principal/ed25519";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [k, v] of Object.entries(loadEnv("", root, ""))) {
  if (process.env[k] === undefined) process.env[k] = v;
}

const proofStr = process.env.STORACHA_PROOF?.trim();
const principalStr = process.env.STORACHA_PRINCIPAL?.trim();
if (!proofStr || !principalStr) {
  console.error("STORACHA_PROOF / STORACHA_PRINCIPAL not set");
  process.exit(1);
}

const browserAgent = await generate();
const client = await Client.create({
  store: new StoreMemory(),
  principal: Signer.parse(principalStr),
});
const proof = await Proof.parse(proofStr);
const space = await client.addSpace(proof);
await client.setCurrentSpace(space.did());

const delegation = await client.createDelegation(
  browserAgent,
  ["space/blob/add", "space/index/add", "upload/add", "filecoin/offer"],
  { expiration: Math.floor(Date.now() / 1000) + 3600 },
);
const archive = await delegation.archive();
if (!archive.ok) throw new Error("archive failed");
const bytes =
  archive.ok instanceof Uint8Array ? archive.ok : new Uint8Array(archive.ok);
const b64 = Buffer.from(bytes).toString("base64");
console.log(`ok: delegation length ${b64.length} for ${browserAgent.did()}`);
