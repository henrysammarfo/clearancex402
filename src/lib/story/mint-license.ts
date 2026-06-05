import { AENEID_ROYALTY_MODULE } from "@line-stack/cdr-core";
import type { StoryClient } from "@story-protocol/core-sdk";
import { parseEther } from "viem";

export type MintBuyerLicenseResult = {
  licenseTokenId: bigint;
  depositTxHash?: string;
  approveTxHash?: string;
  mintTxHash?: string;
};

/**
 * Wrap IP → approve RoyaltyModule → mint license token (Story docs IP Asset Vaults).
 */
export async function mintBuyerLicense(params: {
  storyClient: StoryClient;
  licensorIpId: string;
  licenseTermsId: bigint;
  /** WIP amount for deposit + approve (default 1 IP) */
  mintFeeWei?: bigint;
}): Promise<MintBuyerLicenseResult> {
  const fee = params.mintFeeWei ?? parseEther("1");

  const deposit = await params.storyClient.wipClient.deposit({ amount: fee });
  await params.storyClient.wipClient.approve({
    spender: AENEID_ROYALTY_MODULE,
    amount: fee,
  });

  const mint = await params.storyClient.license.mintLicenseTokens({
    licensorIpId: params.licensorIpId,
    licenseTermsId: params.licenseTermsId,
    amount: 1,
  });

  const licenseTokenId = mint.licenseTokenIds?.[0];
  if (licenseTokenId === undefined) {
    throw new Error("mintLicenseTokens did not return a license token id.");
  }

  return {
    licenseTokenId,
    depositTxHash: deposit.txHash,
    mintTxHash: mint.txHash,
  };
}
