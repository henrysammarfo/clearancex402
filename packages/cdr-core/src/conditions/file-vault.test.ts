import { describe, expect, it } from "vitest";
import {
  AENEID_CONDITION_CONTRACTS,
  AENEID_LINESTACK_CONTRACTS,
  encodeBuyerReadConditionData,
  fileVaultUploadConditions,
} from "../index.js";

const owner = "0xB883e76A4f6841E72cAF1C28ba00f78df974f448" as const;

describe("fileVaultUploadConditions", () => {
  it("uses Story owner-write + Line Stack buyer-read for publisher-only files", () => {
    const c = fileVaultUploadConditions({ owner });
    expect(c.writeConditionAddr).toBe(AENEID_CONDITION_CONTRACTS.ownerWrite);
    expect(c.readConditionAddr.toLowerCase()).toBe(
      AENEID_LINESTACK_CONTRACTS.buyerReadCondition.toLowerCase(),
    );
    expect(c.readConditionData).toBe(encodeBuyerReadConditionData(owner));
  });

  it("uses license read when IP is registered", () => {
    const ipId = "0x0000000000000000000000000000000000000001" as const;
    const c = fileVaultUploadConditions({ owner, ipId, licenseGated: true });
    expect(c.readConditionAddr).toBe(AENEID_CONDITION_CONTRACTS.licenseRead);
  });
});
