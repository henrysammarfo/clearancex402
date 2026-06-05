import type { Address } from "viem";
import { encodeBuyerReadConditionData, encodePublisherWriteConditionData } from "../conditions/linestack-conditions.js";
import { isZeroAddress, loadLineStackContracts } from "../contracts/addresses.js";

/**
 * Dataset vault: publisher-only read/write. Uses owner allowlist (skip validation)
 * so fulfill can decrypt on Aeneid without a separate publisher-read condition contract.
 */
export function linestackDatasetAllocateConditions(owner: Address): {
  writeConditionAddr: Address;
  readConditionAddr: Address;
  writeConditionData: `0x${string}`;
  readConditionData: `0x${string}`;
  skipConditionValidation: boolean;
} {
  return {
    writeConditionAddr: owner,
    readConditionAddr: owner,
    writeConditionData: "0x",
    readConditionData: "0x",
    skipConditionValidation: true,
  };
}

/** Per-buyer result vault: Line Stack buyer-read condition when deployed. */
export function linestackResultVaultAllocateConditions(
  publisher: Address,
  buyer: Address,
): {
  writeConditionAddr: Address;
  readConditionAddr: Address;
  writeConditionData: `0x${string}`;
  readConditionData: `0x${string}`;
  skipConditionValidation: boolean;
} {
  const c = loadLineStackContracts();
  if (c && !isZeroAddress(c.buyerReadCondition) && !isZeroAddress(c.publisherWriteCondition)) {
    return {
      writeConditionAddr: c.publisherWriteCondition,
      readConditionAddr: c.buyerReadCondition,
      writeConditionData: encodePublisherWriteConditionData(publisher),
      readConditionData: encodeBuyerReadConditionData(buyer),
      skipConditionValidation: false,
    };
  }
  return {
    writeConditionAddr: publisher,
    readConditionAddr: buyer,
    writeConditionData: "0x",
    readConditionData: "0x",
    skipConditionValidation: true,
  };
}
