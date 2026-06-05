import { getRegistrySnapshot, registryMutate } from "@/lib/registry/store";

export type BuyerLicenseRecord = {
  listingId: string;
  ipId: string;
  licenseTokenId: string;
  licenseTermsId: string;
  buyer: string;
  mintTxHash?: string;
  purchasedAt: string;
};

export async function saveBuyerLicense(record: BuyerLicenseRecord): Promise<void> {
  await registryMutate({ op: "upsert", path: "buyerLicenses", record });
}

export function getBuyerLicenseForListing(
  listingId: string,
  buyer: string,
): BuyerLicenseRecord | undefined {
  return getRegistrySnapshot().buyerLicenses.find(
    (r) => r.listingId === listingId && r.buyer.toLowerCase() === buyer.toLowerCase(),
  );
}

export function getBuyerLicenseForIp(ipId: string, buyer: string): BuyerLicenseRecord | undefined {
  return getRegistrySnapshot().buyerLicenses.find(
    (r) => r.ipId.toLowerCase() === ipId.toLowerCase() && r.buyer.toLowerCase() === buyer.toLowerCase(),
  );
}
