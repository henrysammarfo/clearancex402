import {
  AENEID_PUBLIC_SPG_NFT,
  type StorachaProvider,
} from "@line-stack/cdr-core";
import type { StoryClient } from "@story-protocol/core-sdk";
import { PILFlavor, WIP_TOKEN_ADDRESS, royaltyPolicyLapAddress } from "@story-protocol/core-sdk";
import { parseEther } from "viem";

export type LicenseTemplate = "non-commercial" | "commercial-use" | "commercial-remix";

async function sha256MetadataHash(payload: unknown): Promise<`0x${string}`> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `0x${hex}` as `0x${string}`;
}

function licenseTermsForTemplate(template: LicenseTemplate) {
  const royaltyPolicy = royaltyPolicyLapAddress["1315"] as `0x${string}`;
  switch (template) {
    case "non-commercial":
      return [
        {
          terms: PILFlavor.creativeCommonsAttribution({
            currency: WIP_TOKEN_ADDRESS,
            royaltyPolicy,
          }),
        },
      ];
    case "commercial-use":
      return [
        {
          terms: PILFlavor.commercialUse({
            defaultMintingFee: parseEther("0.01"),
            currency: WIP_TOKEN_ADDRESS,
            royaltyPolicy,
          }),
        },
      ];
    case "commercial-remix":
      return [
        {
          terms: PILFlavor.commercialRemix({
            defaultMintingFee: parseEther("0.01"),
            commercialRevShare: 10,
            currency: WIP_TOKEN_ADDRESS,
            royaltyPolicy,
          }),
        },
      ];
  }
}

async function uploadRegistrationJson(
  storacha: StorachaProvider | null | undefined,
  payload: unknown,
): Promise<{ cid: string; uri: string }> {
  const { uploadJsonMetadata } = await import("../storage/upload-json-metadata.js");
  const viaProxy = await uploadJsonMetadata(payload);
  if (viaProxy) return viaProxy;
  if (!storacha) {
    throw new Error(
      "Set IPFS_PROXY_URL + IPFS_PROXY_SECRET (preferred) or STORACHA_PROOF for IP metadata upload.",
    );
  }
  const { uploadJsonToStoracha } = await import("../storacha/node-provider.js");
  return uploadJsonToStoracha(storacha, payload);
}

export async function registerVaultIpAsset(params: {
  storyClient: StoryClient;
  storacha?: StorachaProvider | null;
  title: string;
  description: string;
  vaultUuid: string;
  creatorAddress: string;
  licenseTemplate: LicenseTemplate;
}): Promise<{ ipId: string; txHash: string; ipMetadataUri: string; licenseTermsId?: string }> {
  const ipMetadata = {
    title: params.title,
    description: params.description,
    creators: [{ name: params.creatorAddress, address: params.creatorAddress }],
    vaultUuid: params.vaultUuid,
  };
  const nftMetadata = {
    name: params.title,
    description: params.description,
    image: "",
  };

  const { uri: ipMetadataURI } = await uploadRegistrationJson(params.storacha, ipMetadata);
  const { uri: nftMetadataURI } = await uploadRegistrationJson(params.storacha, nftMetadata);

  const ipMetadataHash = await sha256MetadataHash(ipMetadata);
  const nftMetadataHash = await sha256MetadataHash(nftMetadata);

  const response = await params.storyClient.ipAsset.registerIpAsset({
    nft: {
      type: "mint",
      spgNftContract: AENEID_PUBLIC_SPG_NFT,
    },
    ipMetadata: {
      ipMetadataURI,
      ipMetadataHash,
      nftMetadataURI,
      nftMetadataHash,
    },
    licenseTermsData: licenseTermsForTemplate(params.licenseTemplate),
  });

  const rawTerms = response as { licenseTermsIds?: bigint[]; licenseTermsId?: bigint };
  const termsId = rawTerms.licenseTermsIds?.[0] ?? rawTerms.licenseTermsId;

  return {
    ipId: response.ipId ?? "",
    txHash: response.txHash ?? "",
    ipMetadataUri: ipMetadataURI,
    licenseTermsId: termsId !== undefined ? String(termsId) : undefined,
  };
}
