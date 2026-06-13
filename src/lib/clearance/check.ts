import type { ClearanceState } from "@/components/clearance/ClearanceBadge";
import {
  appendAudit,
  ensureStoreHydrated,
  getProbe,
  getVeniceEval,
  listPermissions,
  type CheckDecision,
} from "@/lib/clearance/store";
import { getToolDefinition, parseUsd } from "@/lib/clearance/registry";
import { normalizeWallet } from "@/lib/clearance/account-wallet";

const STALE_PROBE_MS = 60 * 60 * 1000;

export type CheckInput = {
  wallet: string;
  agentId: string;
  toolId: string;
  amountUsd: number;
  userWallet?: string;
};

export async function checkBeforePayment(input: CheckInput): Promise<CheckDecision> {
  const wallet = normalizeWallet(input.wallet);
  await ensureStoreHydrated(wallet);
  const tool = await getToolDefinition(input.toolId, wallet);
  if (!tool) {
    return block(["Unknown tool"]);
  }

  if (tool.simulateBlock) {
    await appendAudit(wallet, {
      kind: "BLOCK",
      tool: tool.name,
      actor: "guardian-agent",
      detail: "Simulated risky endpoint — price/output mismatch",
    });
    return block(["Price mismatch vs on-chain requirement", "Endpoint flagged as high risk"]);
  }

  const defaultTrust = 70;
  const probe = getProbe(wallet, input.toolId);
  if (!probe) {
    return {
      state: "RETEST",
      trust: defaultTrust,
      reasons: ["No live probe on record — run clearance probe first"],
    };
  }

  if (probe.error || !probe.paymentValid) {
    await appendAudit(wallet, {
      kind: "BLOCK",
      tool: tool.name,
      actor: "guardian-agent",
      detail: probe.error ?? "Payment probe failed",
    });
    return block([probe.error ?? "x402 payment flow failed", "402 challenge or settlement invalid"]);
  }

  const probeAge = Date.now() - new Date(probe.finishedAt).getTime();
  if (probeAge > STALE_PROBE_MS) {
    return {
      state: "RETEST",
      trust: defaultTrust,
      reasons: ["Probe is stale — re-run before payment"],
    };
  }

  const venice = getVeniceEval(wallet, input.toolId);
  if (venice && venice.riskLabel === "high") {
    await appendAudit(wallet, {
      kind: "BLOCK",
      tool: tool.name,
      actor: "guardian-agent",
      detail: `Venice risk=${venice.riskLabel}`,
    });
    return block([`Venice risk label: ${venice.riskLabel}`, venice.summary]);
  }

  const advertised = parseUsd(tool.price);
  if (advertised > 0 && input.amountUsd > advertised * 1.5) {
    return {
      state: "WARN",
      trust: defaultTrust,
      reasons: ["Spend exceeds advertised price band", "Proceed with caution"],
    };
  }

  const userWallet = input.userWallet ?? wallet;
  const perms = listPermissions(wallet).filter(
    (p) =>
      p.agentId === input.agentId &&
      !p.revokedAt &&
      new Date(p.expiresAt) > new Date() &&
      p.userWallet.toLowerCase() === userWallet.toLowerCase(),
  );

  if (perms.length === 0) {
    return {
      state: "HUMAN_APPROVAL_REQUIRED",
      trust: defaultTrust,
      reasons: [
        "No active ERC-7715 permission for this agent",
        "Grant permission on /permissions via MetaMask Smart Accounts Kit",
      ],
    };
  }

  const perm = perms[0];
  if (!perm.permissionContext) {
    return {
      state: "HUMAN_APPROVAL_REQUIRED",
      trust: defaultTrust,
      reasons: ["Permission missing ERC-7715 context — re-grant via MetaMask"],
    };
  }

  const domainOk = perm.allowedDomains.some((d) => {
    try {
      const host = new URL(tool.endpoint).hostname;
      return host === d || host.endsWith(d.replace(/^\*\./, ""));
    } catch {
      return false;
    }
  });

  if (!domainOk) {
    await appendAudit(wallet, {
      kind: "BLOCK",
      tool: tool.name,
      actor: "guardian-agent",
      detail: `Domain not in allowlist for ${input.agentId}`,
    });
    return block(["Endpoint domain not allowed by ERC-7715 permission scope"]);
  }

  if (input.amountUsd > perm.maxPerCallUsd) {
    return {
      state: "HUMAN_APPROVAL_REQUIRED",
      trust: defaultTrust,
      reasons: [
        `Spend $${input.amountUsd.toFixed(3)} exceeds per-call cap $${perm.maxPerCallUsd.toFixed(2)}`,
      ],
    };
  }

  if (perm.spentUsd + input.amountUsd > perm.dailyLimitUsd) {
    return {
      state: "HUMAN_APPROVAL_REQUIRED",
      trust: defaultTrust,
      reasons: ["Daily spend limit would be exceeded"],
    };
  }

  const trust = computeTrust(probe, venice);
  const state: ClearanceState =
    venice && venice.driftScore > 0.25 ? "WARN" : trust >= 70 ? "ALLOW" : "WARN";

  return {
    state,
    trust,
    reasons: [
      "Valid 402 challenge + receipt",
      "Advertised price within mandate",
      venice ? `Venice quality ${venice.qualityScore}` : "Output probe OK",
      `ERC-7715 context ${perm.permissionContext.slice(0, 10)}…`,
      perm.redelegatedContext ? "ERC-7710 redelegation active" : "Awaiting redelegation for buyer pay",
    ],
  };
}

function computeTrust(
  probe: NonNullable<ReturnType<typeof getProbe>>,
  venice: ReturnType<typeof getVeniceEval>,
): number {
  let score = 70;
  if (probe.challengeValid) score += 10;
  if (probe.paymentValid) score += 10;
  if (probe.responseValid) score += 5;
  if (venice) score += Math.round(venice.qualityScore / 10);
  return Math.min(99, score);
}

function block(reasons: string[]): CheckDecision {
  return { state: "BLOCK", trust: 20, reasons };
}

export type { CheckDecision };
