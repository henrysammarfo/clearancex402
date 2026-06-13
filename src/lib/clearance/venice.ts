import { getServerEnv } from "@/lib/env/server";
import { appendAudit, saveVeniceEval, type VeniceEvalResult } from "@/lib/clearance/store";
import { getToolDefinition } from "@/lib/clearance/registry";
import { normalizeWallet } from "@/lib/clearance/account-wallet";
import { evaluateHeuristically, shouldUseHeuristicFallback } from "@/lib/clearance/venice-heuristic";

export type VeniceEvalInput = {
  wallet: string;
  toolId: string;
  toolDescription: string;
  responsePreview: string;
  previousPreview?: string;
};

/** Primary eval: Venice API key. Falls back to local heuristic when credits/key unavailable. */
export async function evaluateWithVenice(input: VeniceEvalInput): Promise<VeniceEvalResult> {
  const wallet = normalizeWallet(input.wallet);
  const tool = await getToolDefinition(input.toolId, wallet);

  try {
    const result = await evaluateWithVeniceApi(input);
    await saveVeniceEval(wallet, result);
    await appendAudit(wallet, {
      kind: "VENICE",
      tool: tool?.name ?? input.toolId,
      actor: "verifier-agent",
      detail: `venice quality=${result.qualityScore} · drift=${result.driftScore.toFixed(2)} · ${result.riskLabel}`,
    });
    return result;
  } catch (e) {
    if (!shouldUseHeuristicFallback(e)) throw e;
    const reason = e instanceof Error ? e.message.slice(0, 120) : String(e);
    const result = evaluateHeuristically({ ...input, reason });
    await saveVeniceEval(wallet, result);
    await appendAudit(wallet, {
      kind: "VENICE",
      tool: tool?.name ?? input.toolId,
      actor: "verifier-agent",
      detail: `heuristic quality=${result.qualityScore} · ${result.riskLabel} · ${reason}`,
    });
    return result;
  }
}

async function evaluateWithVeniceApi(input: VeniceEvalInput): Promise<VeniceEvalResult> {
  const { veniceApiKey, veniceApiUrl } = getServerEnv();

  if (!veniceApiKey) {
    throw new Error("VENICE_API_KEY is required — set it in server environment.");
  }

  const prompt = `You evaluate paid x402 API tool output for a trust layer.
Tool: ${input.toolDescription}
Response preview: ${input.responsePreview.slice(0, 2000)}
${input.previousPreview ? `Previous verified output: ${input.previousPreview.slice(0, 1000)}` : ""}

Reply JSON only: {"qualityScore":0-100,"driftScore":0-1,"riskLabel":"low"|"medium"|"high","summary":"one sentence"}`;

  const res = await fetch(`${veniceApiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${veniceApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "venice-uncensored",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 256,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Venice API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Venice returned non-JSON evaluation");
  }

  const parsed = JSON.parse(match[0]) as Partial<VeniceEvalResult>;

  return {
    id: `venice-${Date.now()}`,
    toolId: input.toolId,
    qualityScore: clamp(Number(parsed.qualityScore), 0, 100),
    driftScore: clamp(Number(parsed.driftScore), 0, 1),
    riskLabel: (parsed.riskLabel as VeniceEvalResult["riskLabel"]) ?? "low",
    summary: parsed.summary ?? "Venice evaluation completed.",
    evaluatedAt: new Date().toISOString(),
    evalSource: "venice",
  };
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
