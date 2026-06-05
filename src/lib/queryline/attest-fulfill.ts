import { AENEID_CHAIN_ID } from "@line-stack/cdr-core";
import {
  fulfillAttestationDomain,
  fulfillAttestationTypes,
  hashFulfillAttestation,
  hashFulfillResultPayload,
  verifyFulfillAttestation,
  type FulfillAttestationMessage,
  type RegistryFulfillAttestation,
} from "@line-stack/cdr-core/attestation/browser";
import type { Address, Hex, WalletClient } from "viem";

export function buildFulfillAttestationMessage(params: {
  requestId: string;
  templateId: string;
  datasetCdrUuid: string;
  resultCdrUuid: string;
  resultJsonUtf8: string;
}): FulfillAttestationMessage {
  return {
    requestId: params.requestId,
    templateId: params.templateId,
    datasetCdrUuid: params.datasetCdrUuid,
    resultCdrUuid: params.resultCdrUuid,
    resultPayloadHash: hashFulfillResultPayload(params.resultJsonUtf8),
  };
}

export async function signFulfillAttestationBrowser(params: {
  walletClient: WalletClient;
  account: Address;
  message: FulfillAttestationMessage;
}): Promise<RegistryFulfillAttestation> {
  const signature = await params.walletClient.signTypedData({
    account: params.account,
    domain: fulfillAttestationDomain(AENEID_CHAIN_ID),
    types: fulfillAttestationTypes,
    primaryType: "FulfillAttestation",
    message: params.message,
  });

  return {
    bindingHash: hashFulfillAttestation(params.message, AENEID_CHAIN_ID),
    signature,
    signer: params.account,
    signedAt: new Date().toISOString(),
  };
}

export async function verifyStoredFulfillAttestation(params: {
  attestation: RegistryFulfillAttestation;
  message: FulfillAttestationMessage;
  expectedPublisher: Address;
}): Promise<boolean> {
  return verifyFulfillAttestation({
    message: params.message,
    signature: params.attestation.signature as Hex,
    expectedSigner: params.expectedPublisher,
    chainId: AENEID_CHAIN_ID,
  });
}
