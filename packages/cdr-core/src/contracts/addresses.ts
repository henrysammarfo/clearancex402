export type LineStackDeployedContracts = {
  chainId: number;
  datasetRegistry: `0x${string}`;
  templateRegistry: `0x${string}`;
  publisherWriteCondition: `0x${string}`;
  buyerReadCondition: `0x${string}`;
  merkleAllowlistReadCondition: `0x${string}`;
};

const ZERO = "0x0000000000000000000000000000000000000000" as const;

/** `contracts/deployed.aeneid.json` — used when env vars are unset (e.g. Vercel without LINESTACK_*). */
const AENEID_DEPLOYED_FALLBACK: LineStackDeployedContracts = {
  chainId: 1315,
  datasetRegistry: "0x176018c6c8c445807fe3688f463487e4b01c8ae3",
  templateRegistry: "0xe39d684dede7d04c063121878c6c52a223b82e0c",
  publisherWriteCondition: "0xcfe325f00cf0e3b727680f7727b81aaa1c4dcfe0",
  buyerReadCondition: "0xcd3a4992c0de81ceb78cf9b58bd76c31bcf08792",
  merkleAllowlistReadCondition: "0x0e872eb23deb91da38e5f53a042cf1818cf4bc11",
};

function addrFromEnv(key: string): `0x${string}` | undefined {
  let v: string | undefined;
  if (typeof process !== "undefined" && process.env?.[key]) {
    v = process.env[key];
  } else if (typeof import.meta !== "undefined") {
    const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
    v = meta.env?.[key];
  }
  v = v?.trim();
  if (!v || !/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as `0x${string}`;
}

/** Load deployed addresses from env (`LINESTACK_*` / `VITE_LINESTACK_*`). */
export function loadLineStackContracts(): LineStackDeployedContracts | null {
  const datasetRegistry =
    addrFromEnv("LINESTACK_DATASET_REGISTRY") ??
    addrFromEnv("VITE_LINESTACK_DATASET_REGISTRY");
  const templateRegistry =
    addrFromEnv("LINESTACK_TEMPLATE_REGISTRY") ??
    addrFromEnv("VITE_LINESTACK_TEMPLATE_REGISTRY");

  if (datasetRegistry && templateRegistry) {
    return {
      chainId: 1315,
      datasetRegistry,
      templateRegistry,
      publisherWriteCondition:
        addrFromEnv("LINESTACK_PUBLISHER_WRITE_CONDITION") ??
        addrFromEnv("VITE_LINESTACK_PUBLISHER_WRITE_CONDITION") ??
        AENEID_DEPLOYED_FALLBACK.publisherWriteCondition,
      buyerReadCondition:
        addrFromEnv("LINESTACK_BUYER_READ_CONDITION") ??
        addrFromEnv("VITE_LINESTACK_BUYER_READ_CONDITION") ??
        AENEID_DEPLOYED_FALLBACK.buyerReadCondition,
      merkleAllowlistReadCondition:
        addrFromEnv("LINESTACK_MERKLE_ALLOWLIST_READ_CONDITION") ??
        addrFromEnv("VITE_LINESTACK_MERKLE_ALLOWLIST_READ_CONDITION") ??
        AENEID_DEPLOYED_FALLBACK.merkleAllowlistReadCondition,
    };
  }

  return AENEID_DEPLOYED_FALLBACK;
}

export function lineStackContractsConfigured(): boolean {
  return loadLineStackContracts() !== null;
}

export function isZeroAddress(addr: `0x${string}`): boolean {
  return addr.toLowerCase() === ZERO;
}
