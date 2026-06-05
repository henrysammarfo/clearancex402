import type { Address } from "viem";
import { AENEID_CONDITION_CONTRACTS, AENEID_LINESTACK_CONTRACTS } from "../config/aeneid.js";
import { isZeroAddress, loadLineStackContracts } from "../contracts/addresses.js";
import { encodeBuyerReadConditionData } from "./linestack-conditions.js";
import { encodeLicenseReadConditionData, encodeOwnerWriteConditionData } from "./story-license.js";

export type FileVaultUploadConditions = {
  writeConditionAddr: Address;
  readConditionAddr: Address;
  writeConditionData: `0x${string}`;
  readConditionData: `0x${string}`;
};

/**
 * CDR uploadFile conditions for Vaultline encrypted files (IPFS/Storacha).
 * Publisher-only read uses LineStackBuyerReadCondition with owner encoded as allowed reader.
 */
export function fileVaultUploadConditions(params: {
  owner: Address;
  ipId?: Address;
  licenseGated?: boolean;
}): FileVaultUploadConditions {
  const writeOwner = encodeOwnerWriteConditionData(params.owner);

  if (params.licenseGated && params.ipId) {
    return {
      writeConditionAddr: AENEID_CONDITION_CONTRACTS.ownerWrite,
      readConditionAddr: AENEID_CONDITION_CONTRACTS.licenseRead,
      writeConditionData: writeOwner,
      readConditionData: encodeLicenseReadConditionData(params.ipId),
    };
  }

  const deployed = loadLineStackContracts();
  const buyerRead =
    deployed && !isZeroAddress(deployed.buyerReadCondition)
      ? deployed.buyerReadCondition
      : AENEID_LINESTACK_CONTRACTS.buyerReadCondition;

  return {
    writeConditionAddr: AENEID_CONDITION_CONTRACTS.ownerWrite,
    readConditionAddr: buyerRead,
    writeConditionData: writeOwner,
    readConditionData: encodeBuyerReadConditionData(params.owner),
  };
}
