import {
  type Address,
  type Hex,
  encodePacked,
  hashTypedData,
  keccak256,
  recoverTypedDataAddress,
} from "viem";
import { AENEID_CHAIN_ID } from "../config/aeneid.js";

export type FulfillAttestationMessage = {
  requestId: string;
  templateId: string;
  datasetCdrUuid: string;
  resultCdrUuid: string;
  resultPayloadHash: Hex;
};

export type StoredFulfillAttestation = {
  bindingHash: Hex;
  signature: Hex;
  signer: Address;
  signedAt: string;
  automata?: {
    txHash: Hex;
    success: boolean;
  };
};

export const fulfillAttestationTypes = {
  FulfillAttestation: [
    { name: "requestId", type: "string" },
    { name: "templateId", type: "string" },
    { name: "datasetCdrUuid", type: "string" },
    { name: "resultCdrUuid", type: "string" },
    { name: "resultPayloadHash", type: "bytes32" },
  ],
} as const;

export function fulfillAttestationDomain(chainId: number = AENEID_CHAIN_ID) {
  return {
    name: "Line Stack Queryline",
    version: "1",
    chainId,
  } as const;
}

/** Canonical hash of the JSON answer written to the result vault. */
export function hashFulfillResultPayload(jsonUtf8: string | Uint8Array): Hex {
  const bytes = typeof jsonUtf8 === "string" ? new TextEncoder().encode(jsonUtf8) : jsonUtf8;
  return keccak256(bytes);
}

export function hashFulfillAttestation(
  message: FulfillAttestationMessage,
  chainId: number = AENEID_CHAIN_ID,
): Hex {
  return hashTypedData({
    domain: fulfillAttestationDomain(chainId),
    types: fulfillAttestationTypes,
    primaryType: "FulfillAttestation",
    message,
  });
}

export async function verifyFulfillAttestation(params: {
  message: FulfillAttestationMessage;
  signature: Hex;
  expectedSigner: Address;
  chainId?: number;
}): Promise<boolean> {
  try {
    const recovered = await recoverTypedDataAddress({
      domain: fulfillAttestationDomain(params.chainId ?? AENEID_CHAIN_ID),
      types: fulfillAttestationTypes,
      primaryType: "FulfillAttestation",
      message: params.message,
      signature: params.signature,
    });
    return recovered.toLowerCase() === params.expectedSigner.toLowerCase();
  } catch {
    return false;
  }
}

/** Compact binding id for registry / explorers (not the EIP-712 digest). */
export function fulfillBindingId(message: FulfillAttestationMessage): Hex {
  return keccak256(
    encodePacked(
      ["string", "string", "string", "string", "bytes32"],
      [
        message.requestId,
        message.templateId,
        message.datasetCdrUuid,
        message.resultCdrUuid,
        message.resultPayloadHash,
      ],
    ),
  );
}
