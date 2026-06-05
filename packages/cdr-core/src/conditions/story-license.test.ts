import { decodeAbiParameters } from "viem";
import { describe, expect, it } from "vitest";
import {
  AENEID_LICENSE_TOKEN,
  encodeLicenseAccessAuxData,
  encodeLicenseReadConditionData,
  encodeOwnerWriteConditionData,
} from "./story-license.js";

describe("story license condition encoders", () => {
  const owner = "0xB883e76A4f6841E72cAF1C28ba00f78df974f448" as const;
  const ipId = "0x1234567890123456789012345678901234567890" as const;

  it("encodes owner write condition", () => {
    const data = encodeOwnerWriteConditionData(owner);
    const [addr] = decodeAbiParameters([{ type: "address" }], data);
    expect(addr.toLowerCase()).toBe(owner.toLowerCase());
  });

  it("encodes license read condition", () => {
    const data = encodeLicenseReadConditionData(ipId);
    const [token, decodedIp] = decodeAbiParameters(
      [{ type: "address" }, { type: "address" }],
      data,
    );
    expect(token.toLowerCase()).toBe(AENEID_LICENSE_TOKEN.toLowerCase());
    expect(decodedIp.toLowerCase()).toBe(ipId.toLowerCase());
  });

  it("encodes license access aux", () => {
    const data = encodeLicenseAccessAuxData([42n, 99n]);
    const [ids] = decodeAbiParameters([{ type: "uint256[]" }], data);
    expect(ids).toEqual([42n, 99n]);
  });
});
