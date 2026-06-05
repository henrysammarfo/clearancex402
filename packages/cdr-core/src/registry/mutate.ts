import type {
  RegistryAuditEntry,
  RegistryBuyerLicenseRecord,
  RegistryDatasetRecord,
  RegistryIpAssetRecord,
  RegistryListingRecord,
  RegistryRequestRecord,
  RegistryTemplateRecord,
  RegistryUnlockRecord,
  RegistryVaultFileRecord,
  RegistryVaultRecord,
} from "./types.js";

export type RegistryMutate =
  | { op: "upsert"; path: "vaultline.vaults"; record: RegistryVaultRecord }
  | { op: "upsert"; path: "vaultline.files"; record: RegistryVaultFileRecord }
  | { op: "upsert"; path: "vaultline.unlocks"; record: RegistryUnlockRecord }
  | { op: "upsert"; path: "vaultline.ipAssets"; record: RegistryIpAssetRecord }
  | { op: "upsert"; path: "vaultline.listings"; record: RegistryListingRecord }
  | { op: "append"; path: "vaultline.audit"; record: RegistryAuditEntry }
  | { op: "upsert"; path: "queryline.datasets"; record: RegistryDatasetRecord }
  | { op: "upsert"; path: "queryline.templates"; record: RegistryTemplateRecord }
  | { op: "upsert"; path: "queryline.requests"; record: RegistryRequestRecord }
  | { op: "patch"; path: "queryline.requests"; id: string; patch: Partial<RegistryRequestRecord> }
  | { op: "append"; path: "queryline.audit"; record: RegistryAuditEntry }
  | { op: "upsert"; path: "buyerLicenses"; record: RegistryBuyerLicenseRecord }
  | { op: "delete"; path: "vaultline.vaults"; id: string }
  | { op: "delete"; path: "vaultline.files"; id: string }
  | { op: "delete"; path: "vaultline.listings"; id: string }
  | { op: "delete"; path: "vaultline.ipAssets"; id: string }
  | { op: "delete"; path: "queryline.datasets"; id: string }
  | { op: "delete"; path: "queryline.templates"; id: string }
  | { op: "delete"; path: "queryline.requests"; id: string };
