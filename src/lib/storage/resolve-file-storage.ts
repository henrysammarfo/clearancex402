import { createBrowserStorachaProvider } from "@/lib/storacha/browser-client";
import { createBrowserIpfsProvider, fetchIpfsStatus } from "@/lib/storage/browser-ipfs-provider";
import type { StorageProvider } from "@piplabs/cdr-sdk";

/** Prefer self-hosted IPFS (VPS); fall back to Storacha when only that is configured. */
export async function createFileStorageProvider(): Promise<StorageProvider> {
  const ipfs = await fetchIpfsStatus();
  if (ipfs.available) {
    return createBrowserIpfsProvider();
  }
  return createBrowserStorachaProvider();
}
