/**
 * Story Aeneid testnet constants.
 * @see https://docs.story.foundation/network/connect/aeneid
 * @see https://docs.story.foundation/developers/cdr-sdk/advanced-configuration
 * @see https://github.com/piplabs/cdr-sdk (Condition Contracts table)
 */
export const AENEID_CHAIN_ID = 1315 as const;

export const AENEID_DEFAULTS = {
  /** CDR SDK `network` parameter for Aeneid */
  cdrNetwork: "testnet" as const,
  rpcUrl: "https://aeneid.storyrpc.io",
  storyApiUrl: "http://172.192.41.96:1317",
  explorerTxBaseUrl: "https://aeneid.storyscan.io/tx/",
  networkName: "Story Aeneid Testnet",
} as const;

/** System contracts — SDK embeds these; exported for Line Stack condition builders */
export const AENEID_SYSTEM_CONTRACTS = {
  dkg: "0xCcCcCC0000000000000000000000000000000004",
  cdr: "0xCcCcCC0000000000000000000000000000000005",
} as const;

/** Deployed condition contracts on Aeneid (cdr-sdk README) */
export const AENEID_CONDITION_CONTRACTS = {
  ownerWrite: "0x4C9bFC96d7092b590D497A191826C3dA2277c34B",
  licenseRead: "0xC0640AD4CF2CaA9914C8e5C44234359a9102f7a3",
} as const;

/** Line Stack contracts on Aeneid (`contracts/deployed.aeneid.json`) — baked in for browser uploads */
export const AENEID_LINESTACK_CONTRACTS = {
  buyerReadCondition: "0xcd3a4992c0de81ceb78cf9b58bd76c31bcf08792",
  publisherWriteCondition: "0xcfe325f00cf0e3b727680f7727b81aaa1c4dcfe0",
} as const;

/** Public Story Protocol SPG NFT collection on Aeneid (Story docs) */
export const AENEID_PUBLIC_SPG_NFT = "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc" as const;

export const AENEID_EXPLORER_IPA_BASE = "https://aeneid.explorer.story.foundation/ipa/" as const;

/** On-chain secret path — files larger than this use CDR uploadFile + storage */
export const ON_CHAIN_SECRET_HINT_BYTES = 1024;

export const CDR_DEFAULT_TIMEOUT_MS = 120_000;

export type AeneidAddress =
  (typeof AENEID_SYSTEM_CONTRACTS)[keyof typeof AENEID_SYSTEM_CONTRACTS]
  | (typeof AENEID_CONDITION_CONTRACTS)[keyof typeof AENEID_CONDITION_CONTRACTS];

export function explorerTxUrl(baseUrl: string, txHash: string): string {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${base}${txHash}`;
}
