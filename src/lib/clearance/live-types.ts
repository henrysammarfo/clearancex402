import type { ClearanceState } from "@/components/clearance/ClearanceBadge";
import type { ScoreKey, Tool } from "@/lib/clearance/tools";
import type { ProbeResult, VeniceEvalResult } from "@/lib/clearance/store-types";

export type LiveStatusCheck = {
  label: string;
  detail: string;
  state: ClearanceState;
};

export type EnrichedTool = Tool & {
  expectedSchema?: string;
  builtin?: boolean;
  createdAt?: string;
  probe?: ProbeResult | null;
  venice?: VeniceEvalResult | null;
  checks: LiveStatusCheck[];
};

export type { ScoreKey };
