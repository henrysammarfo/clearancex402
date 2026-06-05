import type { CDRClient } from "@piplabs/cdr-sdk";
import type { StorageProvider } from "@piplabs/cdr-sdk";

export type UploadEncryptedFileParams = {
  content: Uint8Array;
  storageProvider: StorageProvider;
  writeConditionAddr: `0x${string}`;
  readConditionAddr: `0x${string}`;
  writeConditionData?: `0x${string}`;
  readConditionData?: `0x${string}`;
  accessAuxData?: `0x${string}`;
  updatable?: boolean;
};

export type DownloadEncryptedFileParams = {
  uuid: number;
  storageProvider: StorageProvider;
  accessAuxData?: `0x${string}`;
  timeoutMs?: number;
};

/**
 * Encrypt file bytes, upload to storage (Storacha), and allocate + write a CDR file vault.
 */
export async function uploadEncryptedFile(
  client: CDRClient,
  params: UploadEncryptedFileParams,
): Promise<{
  uuid: number;
  cid: string;
  txHash: `0x${string}`;
  allocateTxHash: `0x${string}`;
}> {
  const result = await client.uploader.uploadFile({
    content: params.content,
    storageProvider: params.storageProvider,
    updatable: params.updatable ?? false,
    writeConditionAddr: params.writeConditionAddr,
    readConditionAddr: params.readConditionAddr,
    writeConditionData: params.writeConditionData ?? "0x",
    readConditionData: params.readConditionData ?? "0x",
    accessAuxData: params.accessAuxData ?? "0x",
  });

  return {
    uuid: result.uuid,
    cid: result.cid,
    txHash: result.txHashes.write,
    allocateTxHash: result.txHashes.allocate,
  };
}

/**
 * Access CDR file vault, download ciphertext from storage, and decrypt.
 */
export async function downloadEncryptedFile(
  client: CDRClient,
  params: DownloadEncryptedFileParams,
): Promise<{ content: Uint8Array; cid: string; txHash: `0x${string}` }> {
  const result = await client.consumer.downloadFile({
    uuid: params.uuid,
    accessAuxData: params.accessAuxData ?? "0x",
    storageProvider: params.storageProvider,
    timeoutMs: params.timeoutMs,
  });

  return {
    content: result.content,
    cid: result.cid,
    txHash: result.txHash,
  };
}
