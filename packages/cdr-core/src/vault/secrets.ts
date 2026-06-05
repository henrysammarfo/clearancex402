import { uuidToLabel, type CDRClient } from "@piplabs/cdr-sdk";
import { toHex } from "viem";
import { LineStackError } from "../errors/map-cdr-error.js";

export type WriteSecretToVaultParams = {
  uuid: number;
  secret: Uint8Array;
  accessAuxData?: `0x${string}`;
};

export type ReadSecretFromVaultParams = {
  uuid: number;
  accessAuxData?: `0x${string}`;
  timeoutMs?: number;
};

/**
 * Encrypt plaintext bytes and write them to an existing CDR vault (on-chain secret path).
 * Validates ciphertext size against the chain's `maxEncryptedDataSize` before submitting.
 */
export async function writeSecretToVault(
  client: CDRClient,
  params: WriteSecretToVaultParams,
): Promise<{ txHash: `0x${string}` }> {
  if (params.secret.length === 0) {
    throw new LineStackError("INVALID_INPUT", "Secret payload is empty.");
  }

  const [globalPubKey, maxEncryptedDataSize] = await Promise.all([
    client.observer.getGlobalPubKey(),
    client.observer.getMaxEncryptedDataSize(),
  ]);

  const ciphertext = await client.uploader.encryptDataKey({
    dataKey: params.secret,
    globalPubKey,
    label: uuidToLabel(params.uuid),
  });

  const maxBytes = Number(maxEncryptedDataSize);
  if (ciphertext.raw.length > maxBytes) {
    throw new LineStackError(
      "PAYLOAD_TOO_LARGE",
      `Encrypted payload is ${ciphertext.raw.length} bytes; chain limit is ${maxBytes} bytes. Use uploadFile with storage for larger files.`,
    );
  }

  const { txHash } = await client.uploader.write({
    uuid: params.uuid,
    accessAuxData: params.accessAuxData ?? "0x",
    encryptedData: toHex(ciphertext.raw),
  });

  return { txHash };
}

/**
 * Read and decrypt the on-chain secret for a vault via CDR consumer.accessCDR.
 */
export async function readSecretFromVault(
  client: CDRClient,
  params: ReadSecretFromVaultParams,
): Promise<{ data: Uint8Array; txHash: `0x${string}` }> {
  const { dataKey, txHash } = await client.consumer.accessCDR({
    uuid: params.uuid,
    accessAuxData: params.accessAuxData ?? "0x",
    timeoutMs: params.timeoutMs,
  });

  return { data: dataKey, txHash };
}

/** Parse a vault UUID from user input (numeric CDR uuid). */
export function parseVaultUuid(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
}
