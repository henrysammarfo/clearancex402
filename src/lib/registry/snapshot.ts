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

export type RegistrySnapshot = {
  version: number;
  revision?: number;
  updatedAt: string;
  vaultline: {
    vaults: VaultRecord[];
    files: VaultFileRecord[];
    unlocks: VaultUnlockRecord[];
    ipAssets: IpAssetRecord[];
    listings: ListingRecord[];
    audit: AuditEntry[];
  };
  queryline: {
    datasets: DatasetRecord[];
    templates: QueryTemplateRecord[];
    requests: QueryRequestRecord[];
    audit: AuditEntry[];
  };
  buyerLicenses: BuyerLicenseRecord[];
};

export const EMPTY_REGISTRY_SNAPSHOT: RegistrySnapshot = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  vaultline: {
    vaults: [],
    files: [],
    unlocks: [],
    ipAssets: [],
    listings: [],
    audit: [],
  },
  queryline: {
    datasets: [],
    templates: [],
    requests: [],
    audit: [],
  },
  buyerLicenses: [],
};
