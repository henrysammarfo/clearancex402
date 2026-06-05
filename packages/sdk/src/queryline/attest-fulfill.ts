import {
  AENEID_CHAIN_ID,
  fulfillAttestationDomain,
  fulfillAttestationTypes,
  hashFulfillAttestation,
  hashFulfillResultPayload,
  verifyAutomataDcapQuoteOnChain,
  type FulfillAttestationMessage,
  type RegistryFulfillAttestation,
  type StoredFulfillAttestation,
} from "@line-stack/cdr-core";
import { parseAutomataQuoteFromEnv } from "@line-stack/cdr-core/quote";
import type { Hex, WalletClient } from "viem";

export async function signFulfillAttestation(params: {
  walletClient: WalletClient;
  message: FulfillAttestationMessage;
  chainId?: number;
}): Promise<StoredFulfillAttestation> {
  const account = params.walletClient.account;
  if (!account) throw new Error("Wallet account required to sign fulfill attestation.");

  const chainId = params.chainId ?? AENEID_CHAIN_ID;
  const signature = await params.walletClient.signTypedData({
    account,
    domain: fulfillAttestationDomain(chainId),
    types: fulfillAttestationTypes,
    primaryType: "FulfillAttestation",
    message: params.message,
  });

  const bindingHash = hashFulfillAttestation(params.message, chainId);
  const signer = typeof account === "string" ? account : account.address;

  return {
    bindingHash,
    signature,
    signer,
    signedAt: new Date().toISOString(),
  };
}

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

export async function submitAutomataAttestation(params: {
  walletClient: WalletClient;
  publicClient: import("viem").PublicClient;
  stored: StoredFulfillAttestation;
}): Promise<RegistryFulfillAttestation> {
  const base: RegistryFulfillAttestation = { ...params.stored };

  const quote = parseAutomataQuoteFromEnv();
  if (!quote) {
    throw new Error(
      "Automata DCAP quote required: set AUTOMATA_DCAP_QUOTE_HEX or USE_AUTOMATA_DCAP_FIXTURE=1.",
    );
  }

  const automata = await verifyAutomataDcapQuoteOnChain({
    walletClient: params.walletClient,
    publicClient: params.publicClient,
    quote,
  });

  return {
    ...base,
    automata: {
      txHash: automata.txHash,
      success: automata.success,
    },
  };
}

export function attestationExplorerUrl(txHash: Hex): string {
  return `https://aeneid.storyscan.io/tx/${txHash}`;
}
