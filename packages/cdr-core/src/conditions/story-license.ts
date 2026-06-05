import { encodeAbiParameters } from "viem";

/** Story LicenseToken on Aeneid — @see Story CDR IP Asset Vaults docs */
export const AENEID_LICENSE_TOKEN = "0xFe3838BFb30B34170F00030B52eA4893d8aAC6bC" as const;

/** RoyaltyModule — WIP spender for license mint fees */
export const AENEID_ROYALTY_MODULE = "0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086" as const;

export function encodeOwnerWriteConditionData(owner: `0x${string}`): `0x${string}` {
  return encodeAbiParameters([{ type: "address" }], [owner]);
}

export function encodeLicenseReadConditionData(ipId: `0x${string}`): `0x${string}` {
  return encodeAbiParameters(
    [{ type: "address" }, { type: "address" }],
    [AENEID_LICENSE_TOKEN, ipId],
  );
}

export function encodeLicenseAccessAuxData(licenseTokenIds: bigint[]): `0x${string}` {
  return encodeAbiParameters([{ type: "uint256[]" }], [licenseTokenIds]);
}
