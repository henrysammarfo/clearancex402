import { privateKeyToAccount } from "viem/accounts";
import { getServerEnv } from "@/lib/env/server";
import { createX402Fetch, extract402Challenge } from "@/lib/clearance/x402-client";
import { appendAudit, saveProbe, type ProbeResult } from "@/lib/clearance/store";
import { getToolDefinition, getToolByEndpoint } from "@/lib/clearance/registry";
import { normalizeWallet } from "@/lib/clearance/account-wallet";
import { getToolById, resolveToolEndpoint } from "@/lib/clearance/tools";
import { isBuiltinDemoTool, runBuiltinDemoProbe } from "@/lib/clearance/x402-demo-probe";

export type ProbeOptions = {
  wallet: string;
  toolId?: string;
  endpoint?: string;
  pay?: boolean;
  requestOrigin?: string;
};

export async function runProbe(options: ProbeOptions): Promise<ProbeResult> {
  const wallet = normalizeWallet(options.wallet);

  if (isBuiltinDemoTool(options.toolId) && options.pay !== false) {
    const partial = await runBuiltinDemoProbe(wallet, options.requestOrigin);
    const result: ProbeResult = { id: `probe-${Date.now()}`, ...partial };
    await saveProbe(wallet, result);
    await appendAudit(wallet, {
      kind: result.error ? "BLOCK" : "PROBE",
      tool: "Clearance402 x402 Demo",
      actor: "verifier-agent",
      detail: result.error
        ? `Probe failed: ${result.error}`
        : `402=${result.challengeValid} · paid=${result.paymentValid} · output=${result.responseValid} · ${result.latencyMs}ms`,
    });
    if (result.paymentValid) {
      await appendAudit(wallet, {
        kind: "PAYMENT",
        tool: "Clearance402 x402 Demo",
        actor: "verifier-agent",
        detail: `Probe payment settled · ${result.endpoint}`,
      });
    }
    return result;
  }

  const builtinMeta = options.toolId ? getToolById(options.toolId) : undefined;
  const tool =
    (options.toolId ? await getToolDefinition(options.toolId, wallet) : undefined) ??
    (options.endpoint ? await getToolByEndpoint(options.endpoint, wallet) : undefined);

  let endpoint = options.endpoint ?? tool?.endpoint ?? builtinMeta?.endpoint;
  if (!endpoint) {
    throw new Error("endpoint or toolId required");
  }
  endpoint = resolveToolEndpoint(endpoint, options.requestOrigin);

  const toolId = tool?.id ?? options.toolId ?? endpoint;
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const method = builtinMeta?.probeMethod ?? "GET";
  const skipPay = builtinMeta?.skipX402Pay === true;

  let httpStatus = 0;
  let challengeValid = false;
  let paymentValid = false;
  let responseValid = false;
  let challengeHeaders: Record<string, string> | undefined;
  let responsePreview: string | undefined;
  let paymentProof: string | undefined;
  let error: string | undefined;

  const probeBody = builtinMeta?.probeBody;
  const fetchInit = (body?: string): RequestInit => ({
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body,
  });

  try {
    const unpaid = await fetch(endpoint, fetchInit(probeBody ? JSON.stringify(probeBody) : undefined));
    httpStatus = unpaid.status;
    challengeHeaders = extract402Challenge(unpaid);
    challengeValid =
      unpaid.status === 402 ||
      unpaid.status === 401 ||
      Object.keys(challengeHeaders).length > 0;

    const shouldPay = options.pay !== false && !skipPay;

    if (shouldPay) {
      const { privateKey } = getServerEnv();
      if (!privateKey) {
        throw new Error(
          "WALLET_PRIVATE_KEY not configured — set in server env for verifier probes.",
        );
      }
      const account = privateKeyToAccount(privateKey);
      const fetchWithPayment = createX402Fetch(account);
      const paid = await fetchWithPayment(
        endpoint,
        fetchInit(probeBody ? JSON.stringify(probeBody) : undefined),
      );
      httpStatus = paid.status;
      paymentValid = paid.ok;
      responseValid = paid.ok;

      const paymentHeader =
        paid.headers.get("x-payment-response") ??
        paid.headers.get("payment-response") ??
        paid.headers.get("x-pay-res");
      if (paymentHeader) paymentProof = paymentHeader.slice(0, 512);

      const bodyText = await paid.text();
      responsePreview = bodyText.slice(0, 800);
      if (paid.ok && bodyText.length > 0) {
        try {
          JSON.parse(bodyText);
        } catch {
          responseValid = bodyText.length > 10;
        }
      }
    } else if (builtinMeta?.veniceApi) {
      const { veniceApiKey } = getServerEnv();
      if (veniceApiKey) {
        const authRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${veniceApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            probeBody ?? {
              model: "venice-uncensored",
              messages: [{ role: "user", content: "Reply with one word: cleared" }],
              max_tokens: 16,
            },
          ),
        });
        httpStatus = authRes.status;
        const bodyText = await authRes.text();
        responsePreview = bodyText.slice(0, 800);
        responseValid = authRes.ok && bodyText.length > 0;
        paymentValid = false;
        if (!authRes.ok) {
          error = `Venice API probe ${authRes.status}: ${bodyText.slice(0, 120)}`;
        }
      }
    } else if (!unpaid.ok && unpaid.status !== 402) {
      const bodyText = await unpaid.text();
      responsePreview = bodyText.slice(0, 800);
    } else if (unpaid.ok) {
      const bodyText = await unpaid.text();
      responsePreview = bodyText.slice(0, 800);
      responseValid = bodyText.length > 0;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const result: ProbeResult = {
    id: `probe-${Date.now()}`,
    toolId,
    endpoint,
    startedAt,
    finishedAt: new Date().toISOString(),
    latencyMs: Date.now() - t0,
    httpStatus,
    challengeValid,
    paymentValid,
    responseValid,
    challengeHeaders,
    responsePreview,
    paymentProof,
    error,
  };

  await saveProbe(wallet, result);
  await appendAudit(wallet, {
    kind: error ? "BLOCK" : "PROBE",
    tool: tool?.name ?? builtinMeta?.name ?? toolId,
    actor: "verifier-agent",
    detail: error
      ? `Probe failed: ${error}`
      : `402=${challengeValid} · paid=${paymentValid} · output=${responseValid} · ${result.latencyMs}ms`,
  });

  if (paymentValid) {
    await appendAudit(wallet, {
      kind: "PAYMENT",
      tool: tool?.name ?? builtinMeta?.name ?? toolId,
      actor: "verifier-agent",
      detail: `Probe payment settled · ${endpoint}`,
    });
  }

  return result;
}
