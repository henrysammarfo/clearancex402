import { privateKeyToAccount } from "viem/accounts";
import { getServerEnv } from "@/lib/env/server";
import { createX402Fetch, extract402Challenge } from "@/lib/clearance/x402-client";
import { decryptPrivateKey } from "@/lib/clearance/account-crypto";
import { ensureStoreHydrated, getAgentSession } from "@/lib/clearance/store";
import { normalizeWallet } from "@/lib/clearance/account-wallet";

export type PayExecutionResult = {
  unpaidStatus?: number;
  challengeHeaders?: Record<string, string>;
  httpStatus: number;
  paymentValid: boolean;
  responsePreview: string;
  paymentProof?: string;
  /** Who settled USDC on-chain */
  payer: "agent-session" | "probe-wallet";
};

const DEMO_TOOL_IDS = new Set(["x402-sepolia-demo"]);

export async function payX402WithAgentSession(
  wallet: string,
  agentId: string,
  endpoint: string,
): Promise<Omit<PayExecutionResult, "payer">> {
  const key = normalizeWallet(wallet);
  await ensureStoreHydrated(key);
  const session = getAgentSession(key, agentId);
  if (!session?.encryptedPrivateKey) {
    throw new Error("No agent session — grant permissions on /permissions first");
  }
  const privateKey = decryptPrivateKey(session.encryptedPrivateKey);
  const account = privateKeyToAccount(privateKey);
  const fetchWithPayment = createX402Fetch(account);
  const unpaid = await fetch(endpoint, { method: "GET" });
  const challengeHeaders = extract402Challenge(unpaid);
  const paid = await fetchWithPayment(endpoint, { method: "GET" });
  const bodyText = await paid.text();
  const paymentProof =
    paid.headers.get("x-payment-response") ??
    paid.headers.get("payment-response") ??
    paid.headers.get("x-pay-res") ??
    undefined;

  return {
    unpaidStatus: unpaid.status,
    challengeHeaders,
    httpStatus: paid.status,
    paymentValid: paid.ok,
    responsePreview: bodyText.slice(0, 2000),
    paymentProof,
  };
}

export async function payX402WithProbeWallet(endpoint: string) {
  const { privateKey } = getServerEnv();
  if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY not configured for server probes");
  }
  const account = privateKeyToAccount(privateKey);
  const fetchWithPayment = createX402Fetch(account);
  const unpaid = await fetch(endpoint, { method: "GET" });
  const paid = await fetchWithPayment(endpoint, { method: "GET" });
  const bodyText = await paid.text();
  return {
    unpaidStatus: unpaid.status,
    httpStatus: paid.status,
    paymentValid: paid.ok,
    responsePreview: bodyText.slice(0, 2000),
    paymentProof:
      paid.headers.get("x-payment-response") ??
      paid.headers.get("payment-response") ??
      paid.headers.get("x-pay-res") ??
      undefined,
  };
}

/**
 * Try agent session buyer first; for built-in demo tools fall back to funded probe wallet
 * so pay-if-cleared works in hackathon demos without funding every session EOA.
 */
export async function executePayIfCleared(
  wallet: string,
  agentId: string,
  toolId: string,
  endpoint: string,
): Promise<PayExecutionResult> {
  const sessionAttempt = await payX402WithAgentSession(wallet, agentId, endpoint);
  if (sessionAttempt.paymentValid) {
    return { ...sessionAttempt, payer: "agent-session" };
  }

  if (DEMO_TOOL_IDS.has(toolId)) {
    const probeAttempt = await payX402WithProbeWallet(endpoint);
    if (probeAttempt.paymentValid) {
      return { ...probeAttempt, payer: "probe-wallet" };
    }
    return { ...sessionAttempt, payer: "agent-session" };
  }

  return { ...sessionAttempt, payer: "agent-session" };
}

export function payFailureMessage(result: PayExecutionResult): string {
  const preview = result.responsePreview?.trim();
  if (preview && preview.length < 200) return `x402 payment failed: ${preview}`;
  if (result.httpStatus === 402) {
    return "x402 payment failed — session buyer needs USDC on Base Sepolia, or complete ERC-7710 redelegation on /a2a-lab";
  }
  return `x402 payment failed (HTTP ${result.httpStatus})`;
}
