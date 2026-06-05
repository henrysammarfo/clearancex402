import type { AuditEntry } from "@/components/tables/AuditLogTable";
import type { BuyerLicenseRecord } from "@/lib/vault/buyer-licenses";
import type {
  IpAssetRecord,
  ListingRecord,
  VaultFileRecord,
  VaultRecord,
  VaultUnlockRecord,
} from "@/lib/vault/registry";
import type {
  DatasetRecord,
  QueryRequestRecord,
  QueryTemplateRecord,
} from "@/lib/queryline/registry";

export type RegistryMutate =
  | { op: "upsert"; path: "vaultline.vaults"; record: VaultRecord }
  | { op: "upsert"; path: "vaultline.files"; record: VaultFileRecord }
  | { op: "upsert"; path: "vaultline.unlocks"; record: VaultUnlockRecord }
  | { op: "upsert"; path: "vaultline.ipAssets"; record: IpAssetRecord }
  | { op: "upsert"; path: "vaultline.listings"; record: ListingRecord }
  | { op: "append"; path: "vaultline.audit"; record: AuditEntry }
  | { op: "upsert"; path: "queryline.datasets"; record: DatasetRecord }
  | { op: "upsert"; path: "queryline.templates"; record: QueryTemplateRecord }
  | { op: "upsert"; path: "queryline.requests"; record: QueryRequestRecord }
  | { op: "patch"; path: "queryline.requests"; id: string; patch: Partial<QueryRequestRecord> }
  | { op: "append"; path: "queryline.audit"; record: AuditEntry }
  | { op: "upsert"; path: "buyerLicenses"; record: BuyerLicenseRecord }
  | { op: "delete"; path: "vaultline.vaults"; id: string }
  | { op: "delete"; path: "vaultline.files"; id: string }
  | { op: "delete"; path: "vaultline.listings"; id: string }
  | { op: "delete"; path: "vaultline.ipAssets"; id: string }
  | { op: "delete"; path: "queryline.datasets"; id: string }
  | { op: "delete"; path: "queryline.templates"; id: string }
  | { op: "delete"; path: "queryline.requests"; id: string };
