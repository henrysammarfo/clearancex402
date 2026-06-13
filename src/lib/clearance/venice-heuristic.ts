import type { VeniceEvalResult } from "@/lib/clearance/store-types";

export function evaluateHeuristically(input: {
  toolId: string;
  toolDescription: string;
  responsePreview: string;
  previousPreview?: string;
  reason?: string;
}): VeniceEvalResult {
  const preview = input.responsePreview.trim();
  let qualityScore = 72;
  let driftScore = 0.08;
  let riskLabel: VeniceEvalResult["riskLabel"] = "low";
  const notes: string[] = [];

  if (!preview) {
    qualityScore = 35;
    riskLabel = "medium";
    notes.push("empty response");
  } else if (preview.length < 12) {
    qualityScore = 48;
    riskLabel = "medium";
    notes.push("very short output");
  } else {
    try {
      const parsed = JSON.parse(preview) as Record<string, unknown>;
      if (typeof parsed === "object" && parsed !== null) {
        qualityScore += 12;
        if ("choices" in parsed || "message" in parsed || "content" in parsed) {
          qualityScore += 8;
        }
        if ("error" in parsed) {
          qualityScore -= 25;
          riskLabel = "high";
          notes.push("error field in JSON");
        }
      }
    } catch {
      if (preview.includes("error") || preview.includes("Insufficient")) {
        qualityScore = 42;
        riskLabel = "medium";
        notes.push("error text in body");
      } else {
        qualityScore += 5;
      }
    }
  }

  if (input.previousPreview && input.previousPreview.length > 20) {
    const prev = input.previousPreview.slice(0, 400);
    const cur = preview.slice(0, 400);
    if (prev !== cur) {
      driftScore = 0.18;
      notes.push("differs from previous probe");
    }
  }

  if (input.toolDescription.toLowerCase().includes("block") || input.toolDescription.includes("mismatch")) {
    qualityScore = Math.min(qualityScore, 40);
    riskLabel = "high";
  }

  qualityScore = Math.max(0, Math.min(100, qualityScore));

  const summary =
    notes.length > 0
      ? `Local heuristic eval (${input.reason ?? "Venice unavailable"}): ${notes.join("; ")}`
      : `Local heuristic eval (${input.reason ?? "Venice unavailable"}): structure and length OK`;

  return {
    id: `heuristic-${Date.now()}`,
    toolId: input.toolId,
    qualityScore,
    driftScore,
    riskLabel,
    summary,
    evaluatedAt: new Date().toISOString(),
    evalSource: "heuristic",
  };
}

export function shouldUseHeuristicFallback(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    /402/i.test(msg) ||
    /insufficient/i.test(msg) ||
    /balance/i.test(msg) ||
    /VENICE_API_KEY is required/i.test(msg) ||
    /401/i.test(msg) ||
    /403/i.test(msg)
  );
}
