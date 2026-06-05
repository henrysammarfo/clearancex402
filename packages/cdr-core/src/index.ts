// Config
export {
  AENEID_CHAIN_ID,
  AENEID_CONDITION_CONTRACTS,
  AENEID_LINESTACK_CONTRACTS,
  AENEID_DEFAULTS,
  AENEID_EXPLORER_IPA_BASE,
  AENEID_PUBLIC_SPG_NFT,
  AENEID_SYSTEM_CONTRACTS,
  CDR_DEFAULT_TIMEOUT_MS,
  ON_CHAIN_SECRET_HINT_BYTES,
  explorerTxUrl,
} from "./config/aeneid.js";

export {
  AENEID_LICENSE_TOKEN,
  AENEID_ROYALTY_MODULE,
  encodeLicenseAccessAuxData,
  encodeLicenseReadConditionData,
  encodeOwnerWriteConditionData,
} from "./conditions/story-license.js";

export {
  encodeBuyerReadConditionData,
  encodeMerkleAllowlistAccessAuxData,
  encodeMerkleAllowlistReadConditionData,
  encodePublisherWriteConditionData,
} from "./conditions/linestack-conditions.js";

export { fileVaultUploadConditions, type FileVaultUploadConditions } from "./conditions/file-vault.js";

export {
  lineStackDatasetRegistryAbi,
  lineStackTemplateRegistryAbi,
} from "./contracts/abis.js";

export {
  isZeroAddress,
  lineStackContractsConfigured,
  loadLineStackContracts,
  type LineStackDeployedContracts,
} from "./contracts/addresses.js";

export { computeTemplateId } from "./contracts/template-id.js";

export {
  fetchOnChainDatasets,
  fetchOnChainTemplates,
  registerDatasetOnChain,
  registerTemplateOnChain,
} from "./contracts/registry-chain.js";

export { buildMerkleRoot, getMerkleProof, merkleLeafForAddress } from "./contracts/merkle.js";

export {
  linestackDatasetAllocateConditions,
  linestackResultVaultAllocateConditions,
} from "./cdr/linestack-allocate.js";

export type {
  RegistrySnapshot,
  RegistryVaultRecord,
  RegistryVaultFileRecord,
  RegistryIpAssetRecord,
  RegistryListingRecord,
  RegistryDatasetRecord,
  RegistryTemplateRecord,
  RegistryRequestRecord,
  RegistryFulfillAttestation,
  RegistryBuyerLicenseRecord,
  RegistryAuditEntry,
} from "./registry/types.js";

export { EMPTY_REGISTRY_SNAPSHOT } from "./registry/types.js";

export type { RegistryMutate } from "./registry/mutate.js";

export {
  fetchRegistrySnapshot,
  fetchRegistrySnapshotOrEmpty,
  isRegistryConfigured,
  registryMutate,
} from "./registry/client.js";

// Environment
export {
  envToConfig,
  lineStackEnvSchema,
  loadConfigFromEnv,
  type LineStackConfig,
  type LineStackEnv,
} from "./env/schema.js";

// Chain
export { storyAeneid } from "./chain/story-chain.js";

// Client
export { createLineStackCdrClient, createStoryPublicClient } from "./client/create-cdr-client.js";
export type { CreateCdrClientOptions, LineStackCdrClients } from "./client/create-cdr-client.js";
export { initLineStackCdr, resetWasmInitForTests } from "./client/wasm.js";

// Errors
export {
  isWalletClientRequiredError,
  LineStackError,
  mapUnknownError,
  type LineStackErrorCode,
} from "./errors/map-cdr-error.js";

// Logging
export { createLogger, type Logger, type LogLevel } from "./logging/logger.js";

export {
  downloadEncryptedFile,
  uploadEncryptedFile,
  type DownloadEncryptedFileParams,
  type UploadEncryptedFileParams,
} from "./vault/files.js";

export {
  ProxyStorageProvider,
  type ProxyStorageProviderOptions,
} from "./storage/proxy-provider.js";

// Vault helpers
export {
  parseVaultUuid,
  readSecretFromVault,
  writeSecretToVault,
  type ReadSecretFromVaultParams,
  type WriteSecretToVaultParams,
} from "./vault/secrets.js";

export {
  AENEID_AUTOMATA_DCAP,
  automataDcapAttestationFeeAbi,
} from "./attestation/aeneid-automata.js";
export {
  fulfillAttestationDomain,
  fulfillAttestationTypes,
  fulfillBindingId,
  hashFulfillAttestation,
  hashFulfillResultPayload,
  verifyFulfillAttestation,
  type FulfillAttestationMessage,
  type StoredFulfillAttestation,
} from "./attestation/fulfill-binding.js";
export {
  verifyAutomataDcapQuoteOnChain,
  estimateAutomataAttestationValue,
  type AutomataAttestResult,
} from "./attestation/dcap-onchain.js";

// Re-export official SDK types entry points used by Line Stack layers
export {
  CDRClient,
  CDRError,
  GatewayProvider,
  StorachaProvider,
  conditions,
  initWasm,
  uuidToLabel,
} from "@piplabs/cdr-sdk";
