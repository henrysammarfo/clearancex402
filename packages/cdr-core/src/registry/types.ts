export type RegistryVaultRecord = {
  uuid: string;
  name: string;
  owner: string;
  allocateTxHash: string;
  createdAt: string;
};

export type RegistryVaultFileRecord = {
  id: string;
  vaultUuid: string;
  cdrUuid: string;
  storageKind: "on-chain-secret" | "storacha-file" | "ipfs-file";
  readCondition?: "owner" | "license";
  ipId?: string;
  cid?: string;
  name: string;
  size: number;
  mime: string;
  writeTxHash: string;
  uploadedAt: string;
};

export type RegistryIpAssetRecord = {
  ipId: string;
  vaultUuid: string;
  title: string;
  licenseTemplate: string;
  licenseTermsId?: string;
  ipMetadataUri: string;
  txHash: string;
  registeredAt: string;
};

export type RegistryListingRecord = {
  id: string;
  vaultUuid: string;
  ipId: string;
  /** Wallet that listed / owns the vault at listing time */
  seller: string;
  /** If set, only this address may mint a buyer license */
  allowedBuyer?: string;
  title: string;
  description: string;
  priceWei: string;
  currencyLabel: string;
  licenseTemplate: string;
  licenseTermsId?: string;
  createdAt: string;
};

export type RegistryUnlockRecord = {
  id: string;
  vaultUuid: string;
  fileId: string;
  fileName: string;
  txHash: string;
  unlockedAt: string;
};

export type RegistryAuditEntry = {
  time: string;
  actor: string;
  action: string;
  target: string;
  txHash: string;
  status: "success" | "failed" | "pending" | "unauthorized";
};

export type RegistryDatasetRecord = {
  id: string;
  name: string;
  description: string;
  schemaJson: string;
  cdrUuid: string;
  owner: string;
  allocateTxHash: string;
  createdAt: string;
};

export type RegistryTemplateRecord = {
  id: string;
  datasetId: string;
  name: string;
  description: string;
  paramsSchemaJson: string;
  createdAt: string;
};

export type RegistryFulfillAttestation = {
  bindingHash: string;
  signature: string;
  signer: string;
  signedAt: string;
  automata?: {
    txHash: string;
    success: boolean;
  };
};

export type RegistryRequestRecord = {
  id: string;
  datasetId: string;
  templateId: string;
  buyer: string;
  paramsJson: string;
  status: "pending" | "completed" | "failed";
  resultCdrUuid?: string;
  resultVaultAllocateTx?: string;
  resultWriteTx?: string;
  attestation?: RegistryFulfillAttestation;
  createdAt: string;
  completedAt?: string;
};

export type RegistryBuyerLicenseRecord = {
  listingId: string;
  ipId: string;
  licenseTokenId: string;
  licenseTermsId: string;
  buyer: string;
  mintTxHash?: string;
  purchasedAt: string;
};

export type RegistrySnapshot = {
  version: number;
  /** Monotonic counter for optimistic concurrency (v2+) */
  revision?: number;
  updatedAt: string;
  vaultline: {
    vaults: RegistryVaultRecord[];
    files: RegistryVaultFileRecord[];
    unlocks: RegistryUnlockRecord[];
    ipAssets: RegistryIpAssetRecord[];
    listings: RegistryListingRecord[];
    audit: RegistryAuditEntry[];
  };
  queryline: {
    datasets: RegistryDatasetRecord[];
    templates: RegistryTemplateRecord[];
    requests: RegistryRequestRecord[];
    audit: RegistryAuditEntry[];
  };
  buyerLicenses: RegistryBuyerLicenseRecord[];
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
