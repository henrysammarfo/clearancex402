import { privateKeyToAccount } from "viem/accounts";
import { getServerEnv } from "@/lib/env/server";
import { createX402Fetch, extract402Challenge } from "@/lib/clearance/x402-client";
import { resolveDemoEndpoint } from "@/lib/clearance/x402-demo-handler";
import type { ProbeResult } from "@/lib/clearance/store-types";

/** Defer loopback fetch until after the current SSR request stack unwinds. */
const deferredFetch: typeof fetch = async (input, init) => {
  await new Promise((r) => setTimeout(r, 50));
  return fetch(input, init);
};

/**
 * Probe built-in demo via deferred HTTP loopback (works in Vite/Nitro dev).
 */
export async function runBuiltinDemoProbe(
  wallet: string,
  requestOrigin?: string,
): Promise<Omit<ProbeResult, "id">> {
  const endpoint = resolveDemoEndpoint(requestOrigin ?? process.env.CLEARANCE402_API_URL);
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const { privateKey } = getServerEnv();
  if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY not configured for demo probe");
  }
  const account = privateKeyToAccount(privateKey);

  const unpaid = await deferredFetch(endpoint, { method: "GET" });
  const challengeHeaders = extract402Challenge(unpaid);
  const challengeValid = unpaid.status === 402 || Object.keys(challengeHeaders).length > 0;

  const fetchWithPayment = createX402Fetch(account, deferredFetch);
  const paid = await fetchWithPayment(endpoint, { method: "GET" });
  const bodyText = await paid.text();

  return {
    toolId: "x402-sepolia-demo",
    endpoint,
    startedAt,
    finishedAt: new Date().toISOString(),
    latencyMs: Date.now() - t0,
    httpStatus: paid.status,
    challengeValid,
    paymentValid: paid.ok,
    responseValid: paid.ok && bodyText.length > 0,
    challengeHeaders,
    responsePreview: bodyText.slice(0, 800),
    paymentProof:
      paid.headers.get("x-payment-response") ??
      paid.headers.get("payment-response") ??
      paid.headers.get("x-pay-res") ??
      undefined,
    error: paid.ok ? undefined : `Demo x402 pay failed http=${paid.status}`,
  };
}

export function isBuiltinDemoTool(toolId?: string): boolean {
  return toolId === "x402-sepolia-demo";
}
