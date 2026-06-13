import { privateKeyToAccount } from "viem/accounts";
import { getServerEnv } from "@/lib/env/server";
import { createX402Fetch, extract402Challenge } from "@/lib/clearance/x402-client";
import { decryptPrivateKey } from "@/lib/clearance/account-crypto";
import { ensureStoreHydrated, getAgentSession } from "@/lib/clearance/store";
import { normalizeWallet } from "@/lib/clearance/account-wallet";

export async function payX402WithAgentSession(wallet: string, agentId: string, endpoint: string) {
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
  const paid = await fetchWithPayment(endpoint, { method: "GET" });
  const bodyText = await paid.text();
  return {
    httpStatus: paid.status,
    paymentValid: paid.ok,
    responsePreview: bodyText.slice(0, 2000),
    paymentProof:
      paid.headers.get("x-payment-response") ??
      paid.headers.get("payment-response") ??
      undefined,
  };
}
