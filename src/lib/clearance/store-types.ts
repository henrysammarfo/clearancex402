import type { ClearanceState } from "@/components/clearance/ClearanceBadge";

export type AuditKind =
  | "PROBE"
  | "PAYMENT"
  | "BLOCK"
  | "APPROVAL"
  | "VENICE"
  | "PERMISSION"
  | "RELAY"
  | "REVOKE"
  | "A2A";

export type AuditEvent = {
  id: string;
  time: string;
  kind: AuditKind;
  tool: string;
  actor: string;
  detail: string;
  txHash?: string;
};

export type ProbeResult = {
  id: string;
  toolId: string;
  endpoint: string;
  startedAt: string;
  finishedAt: string;
  latencyMs: number;
  httpStatus: number;
  challengeValid: boolean;
  paymentValid: boolean;
  responseValid: boolean;
  challengeHeaders?: Record<string, string>;
  responsePreview?: string;
  paymentProof?: string;
  error?: string;
};

export type VeniceEvalResult = {
  id: string;
  toolId: string;
  qualityScore: number;
  driftScore: number;
  riskLabel: "low" | "medium" | "high";
  summary: string;
  evaluatedAt: string;
  /** `venice` when API key + credits succeeded; `heuristic` when local fallback ran */
  evalSource?: "venice" | "heuristic";
};

export type PermissionGrant = {
  id: string;
  userWallet: string;
  agentId: string;
  maxPerCallUsd: number;
  dailyLimitUsd: number;
  allowedDomains: string[];
  expiresAt: string;
  revokedAt?: string;
  spentUsd: number;
  permissionContext?: string;
  delegationManager?: string;
  sessionSmartAccount?: string;
  grantedPayload?: unknown;
  redelegatedContext?: string;
};

export type RedelegationRecord = {
  id: string;
  parentAgentId: string;
  childAgentId: string;
  narrowerCapUsd: number;
  createdAt: string;
  permissionContext?: string;
  delegation?: unknown;
};

export type RegisteredTool = {
  id: string;
  name: string;
  vendor: string;
  endpoint: string;
  protocol: "x402" | "MCP";
  category: string;
  price: string;
  network: string;
  description: string;
  expectedSchema?: string;
  createdAt: string;
};

export type AgentSessionRecord = {
  agentId: string;
  smartAccount: string;
  encryptedPrivateKey: string;
  updatedAt: string;
};

export type ClearanceStore = {
  audit: AuditEvent[];
  probes: Record<string, ProbeResult>;
  veniceEvals: Record<string, VeniceEvalResult>;
  permissions: PermissionGrant[];
  redelegations: RedelegationRecord[];
  customTools: RegisteredTool[];
  agentSessions: Record<string, AgentSessionRecord>;
};

export type CheckDecision = {
  state: ClearanceState;
  trust: number;
  reasons: string[];
};
