import { encodeAbiParameters } from "viem";

/** `writeConditionData` for LineStackPublisherWriteCondition. */
export function encodePublisherWriteConditionData(publisher: `0x${string}`): `0x${string}` {
  return encodeAbiParameters([{ type: "address" }], [publisher]);
}

/** `readConditionData` for LineStackBuyerReadCondition. */
export function encodeBuyerReadConditionData(buyer: `0x${string}`): `0x${string}` {
  return encodeAbiParameters([{ type: "address" }], [buyer]);
}

/** `readConditionData` for LineStackMerkleAllowlistReadCondition. */
export function encodeMerkleAllowlistReadConditionData(root: `0x${string}`): `0x${string}` {
  return encodeAbiParameters([{ type: "bytes32" }], [root]);
}

/** `accessAuxData` — merkle proof for allowlisted address. */
export function encodeMerkleAllowlistAccessAuxData(proof: `0x${string}`[]): `0x${string}` {
  return encodeAbiParameters([{ type: "bytes32[]" }], [proof]);
}
