/** Back-compat re-exports — prefer @/lib/clearance/tools */
export type { ScoreKey, Tool } from "@/lib/clearance/tools";
export { SCORE_LABELS, TOOLS, getToolById as getTool, parseUsd } from "@/lib/clearance/tools";
export type { AuditEvent } from "@/lib/clearance/store-types";

/** @deprecated fetch /api/clearance/audit instead */
export const AUDIT: AuditEvent[] = [];

import type { AuditEvent } from "@/lib/clearance/store-types";
