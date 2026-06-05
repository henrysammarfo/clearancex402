import type { AuditEntry } from "@/components/tables/AuditLogTable";
import { VAULTLINE_REGISTRY_EVENT } from "@/lib/registry/events";
import { getRegistrySnapshot, registryMutate } from "@/lib/registry/store";

export type VaultFileStorageKind = "on-chain-secret" | "storacha-file" | "ipfs-file";

export type VaultRecord = {
  uuid: string;
  name: string;
  owner: string;
  allocateTxHash: string;
  createdAt: string;
};

export type VaultFileRecord = {
  id: string;
  /** Logical vault from create-vault */
  vaultUuid: string;
  /** CDR vault UUID used for read/write (may differ for Storacha file vaults) */
  cdrUuid: string;
  storageKind: VaultFileStorageKind;
  /** How CDR read access is gated */
  readCondition?: "owner" | "license";
  /** Story IP id when readCondition is license */
  ipId?: string;
  cid?: string;
  name: string;
  size: number;
  mime: string;
  writeTxHash: string;
  uploadedAt: string;
};

export type IpAssetRecord = {
  ipId: string;
  vaultUuid: string;
  title: string;
  licenseTemplate: string;
  /** From registerIpAsset — required for buyer mint */
  licenseTermsId?: string;
  ipMetadataUri: string;
  txHash: string;
  registeredAt: string;
};

export type ListingRecord = {
  id: string;
  vaultUuid: string;
  ipId: string;
  seller: string;
  allowedBuyer?: string;
  title: string;
  description: string;
  priceWei: string;
  currencyLabel: string;
  licenseTemplate: string;
  licenseTermsId?: string;
  createdAt: string;
};

export type VaultUnlockRecord = {
  id: string;
  vaultUuid: string;
  fileId: string;
  fileName: string;
  txHash: string;
  unlockedAt: string;
};

export { VAULTLINE_REGISTRY_EVENT };

export function loadVaults(): VaultRecord[] {
  return getRegistrySnapshot().vaultline.vaults;
}

export function loadVaultFiles(): VaultFileRecord[] {
  return getRegistrySnapshot().vaultline.files;
}

export function loadUnlocks(): VaultUnlockRecord[] {
  return getRegistrySnapshot().vaultline.unlocks;
}

export function loadAuditEntries(): AuditEntry[] {
  return getRegistrySnapshot().vaultline.audit;
}

export async function addVault(record: VaultRecord): Promise<void> {
  const vaults = loadVaults();
  if (vaults.some((v) => v.uuid === record.uuid)) return;
  await registryMutate({ op: "upsert", path: "vaultline.vaults", record });
}

export async function addVaultFile(record: VaultFileRecord): Promise<void> {
  await registryMutate({ op: "upsert", path: "vaultline.files", record });
}

export async function addUnlock(record: VaultUnlockRecord): Promise<void> {
  await registryMutate({ op: "upsert", path: "vaultline.unlocks", record });
}

export async function appendAuditEntry(
  entry: Omit<AuditEntry, "time"> & { time?: string },
): Promise<AuditEntry> {
  const full: AuditEntry = {
    ...entry,
    time: entry.time ?? new Date().toISOString(),
  };
  await registryMutate({ op: "append", path: "vaultline.audit", record: full });
  return full;
}

export function getVaultFile(fileId: string): VaultFileRecord | undefined {
  return loadVaultFiles().find((f) => f.id === fileId);
}

export function getVaultFilesForVault(vaultUuid: string): VaultFileRecord[] {
  return loadVaultFiles().filter((f) => f.vaultUuid === vaultUuid);
}

export function getVault(vaultUuid: string): VaultRecord | undefined {
  return loadVaults().find((v) => v.uuid === vaultUuid);
}

export function loadIpAssets(): IpAssetRecord[] {
  return getRegistrySnapshot().vaultline.ipAssets;
}

export function loadListings(): ListingRecord[] {
  return getRegistrySnapshot().vaultline.listings;
}

export async function addIpAsset(record: IpAssetRecord): Promise<void> {
  await registryMutate({ op: "upsert", path: "vaultline.ipAssets", record });
}

export async function addListing(record: ListingRecord): Promise<void> {
  await registryMutate({ op: "upsert", path: "vaultline.listings", record });
}

export function getListing(id: string): ListingRecord | undefined {
  return loadListings().find((l) => l.id === id);
}

export function getIpAssetForVault(vaultUuid: string): IpAssetRecord | undefined {
  return loadIpAssets().find((a) => a.vaultUuid === vaultUuid);
}

export function notifyVaultlineRegistryUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(VAULTLINE_REGISTRY_EVENT));
}

export async function addIpAssetAndNotify(record: IpAssetRecord): Promise<void> {
  await addIpAsset(record);
}

export async function addListingAndNotify(record: ListingRecord): Promise<void> {
  await addListing(record);
}

export async function addVaultAndNotify(record: VaultRecord): Promise<void> {
  await addVault(record);
}

export async function addVaultFileAndNotify(record: VaultFileRecord): Promise<void> {
  await addVaultFile(record);
}

export async function addUnlockAndNotify(record: VaultUnlockRecord): Promise<void> {
  await addUnlock(record);
}

export async function appendAuditAndNotify(
  entry: Omit<AuditEntry, "time"> & { time?: string },
): Promise<AuditEntry> {
  return appendAuditEntry(entry);
}

export async function updateVault(record: VaultRecord): Promise<void> {
  await registryMutate({ op: "upsert", path: "vaultline.vaults", record });
}

export async function deleteVaultFile(fileId: string): Promise<void> {
  await registryMutate({ op: "delete", path: "vaultline.files", id: fileId });
}

export async function deleteListing(listingId: string): Promise<void> {
  await registryMutate({ op: "delete", path: "vaultline.listings", id: listingId });
}

export async function deleteIpAsset(ipId: string): Promise<void> {
  await registryMutate({ op: "delete", path: "vaultline.ipAssets", id: ipId });
}

