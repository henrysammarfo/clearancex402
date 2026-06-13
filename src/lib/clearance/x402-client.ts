import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { CLEARANCE_DEFAULTS } from "@/lib/clearance/network";
import { getAgentSessionPrivateKey } from "@/lib/clearance/agent-session";

export function createX402Fetch(account: PrivateKeyAccount, fetchImpl: typeof fetch = fetch) {
  const client = new x402Client();
  client.register(CLEARANCE_DEFAULTS.x402Network, new ExactEvmScheme(account));
  return wrapFetchWithPayment(fetchImpl, client);
}

export function getSessionBuyerAccount(): PrivateKeyAccount | null {
  const pk = getAgentSessionPrivateKey();
  if (!pk) return null;
  return privateKeyToAccount(pk);
}

export async function payX402Endpoint(endpoint: string, account?: PrivateKeyAccount) {
  const signer = account ?? getSessionBuyerAccount();
  if (!signer) {
    throw new Error(
      "No buyer account — grant permissions first (session key is in-memory only until page reload)",
    );
  }
  const fetchWithPayment = createX402Fetch(signer);
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

export function extract402Challenge(res: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [key, value] of res.headers.entries()) {
    if (
      key.toLowerCase().includes("payment") ||
      key.toLowerCase() === "www-authenticate"
    ) {
      headers[key] = value;
    }
  }
  return headers;
}
