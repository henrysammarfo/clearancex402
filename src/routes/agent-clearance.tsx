import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClearanceBadge, type ClearanceState } from "@/components/clearance/ClearanceBadge";
import { TxFailedState, TxPendingState } from "@/components/states";
import { clearanceApi } from "@/lib/clearance/clearance-api";
import {
  useClearancePermissions,
  useClearanceTools,
  useClearanceWallet,
  useInvalidateClearanceAccount,
} from "@/lib/clearance/use-clearance-account";
import { ConnectWalletPrompt } from "@/components/clearance/ConnectWalletPrompt";

export const Route = createFileRoute("/agent-clearance")({
  head: () => ({
    meta: [
      { title: "Agent clearance · Clearance402" },
      {
        name: "description",
        content: "Ask whether a tool is safe to pay — ALLOW, WARN, BLOCK, RETEST, or HUMAN_APPROVAL_REQUIRED.",
      },
    ],
  }),
  component: Page,
});

type Agent = { id: string; mandateUsd: number };

type Decision = {
  state: ClearanceState;
  trust: number;
  toolName: string;
  reasons: string[];
};

type SubmitState =
  | { phase: "idle" }
  | { phase: "pending" }
  | { phase: "done"; decision: Decision; permissionId?: string }
  | { phase: "paying" }
  | { phase: "paid"; paymentProof: string; responsePreview: string }
  | { phase: "failed"; error: string };

function Page() {
  const { wallet, isConnected } = useClearanceWallet();
  const { data: tools = [] } = useClearanceTools(wallet);
  const { data: permissions = [] } = useClearancePermissions(wallet);
  const invalidate = useInvalidateClearanceAccount();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentName, setAgentName] = useState("buyer-agent");
  const [mandate, setMandate] = useState("5.00");
  const [toolId, setToolId] = useState("x402-sepolia-demo");
  const [amount, setAmount] = useState("0.010");
  const [submit, setSubmit] = useState<SubmitState>({ phase: "idle" });

  const tool = tools.find((t) => t.id === toolId) ?? tools[0];
  const permissionId = permissions.find(
    (p) => p.agentId === agent?.id && p.permissionContext && !p.revokedAt,
  )?.id;

  const parseUsd = (price: string) => {
    const m = price.match(/([\d.]+)/);
    return m ? parseFloat(m[1]) : 0;
  };

  if (!isConnected || !wallet) {
    return (
      <ConsoleShell section="Agent clearance" title="Agent clearance check" description="Connect wallet first.">
        <ConnectWalletPrompt />
      </ConsoleShell>
    );
  }

  const onboard = () => {
    const m = parseFloat(mandate);
    if (!agentName.trim() || Number.isNaN(m) || m <= 0) return;
    setAgent({ id: agentName.trim(), mandateUsd: m });
  };

  const runClearance = async () => {
    if (!agent || !tool) return;
    setSubmit({ phase: "pending" });

    const requested = parseUsd(amount);
    if (Number.isNaN(requested) || requested <= 0) {
      setSubmit({ phase: "failed", error: "Requested spend is not a valid USDC amount." });
      return;
    }

    try {
      const data = (await clearanceApi.check(wallet, {
        agentId: agent.id,
        toolId,
        amountUsd: requested,
        userWallet: wallet,
      })) as {
        decision?: { state: ClearanceState; trust: number; reasons: string[] };
        toolName?: string;
        error?: string;
      };

      if (!data.decision) {
        setSubmit({ phase: "failed", error: "Clearance check failed" });
        return;
      }

      let state = data.decision.state;
      let reasons = [...data.decision.reasons];
      if (requested > agent.mandateUsd && state === "ALLOW") {
        state = "HUMAN_APPROVAL_REQUIRED";
        reasons.unshift(
          `Requested $${requested.toFixed(3)} exceeds local mandate $${agent.mandateUsd.toFixed(2)}`,
        );
      }

      if (state === "BLOCK") {
        setSubmit({
          phase: "failed",
          error: reasons.join(" · ") || "Clearance returned BLOCK",
        });
        return;
      }

      setSubmit({
        phase: "done",
        decision: {
          state,
          trust: data.decision.trust,
          toolName: data.toolName ?? tool.name,
          reasons,
        },
        permissionId,
      });
    } catch (e) {
      setSubmit({
        phase: "failed",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const payIfCleared = async () => {
    if (!agent || submit.phase !== "done") return;
    if (submit.decision.state !== "ALLOW" && submit.decision.state !== "WARN") return;

    setSubmit({ phase: "paying" });
    try {
      const result = (await clearanceApi.pay(wallet, {
        agentId: agent.id,
        toolId,
        userWallet: wallet,
        execute: true,
        permissionId: submit.permissionId ?? permissionId,
      })) as {
        paymentProof?: string;
        responsePreview?: string;
        error?: string;
      };

      if (!result.paymentProof && !result.responsePreview) {
        throw new Error(result.error ?? "Server x402 payment failed — grant session on /permissions");
      }

      invalidate(wallet);
      setSubmit({
        phase: "paid",
        paymentProof: result.paymentProof ?? "server-executed",
        responsePreview: result.responsePreview ?? "",
      });
    } catch (e) {
      setSubmit({
        phase: "failed",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  };

  return (
    <ConsoleShell
      section="Agent clearance"
      title="Agent clearance check"
      description="Live probe + ERC-7715 permission checks on Base Sepolia, then server-side pay-if-cleared."
    >
      {!agent ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand" /> Onboard an agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Agent ID</Label>
              <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Spend mandate (USDC)</Label>
              <Input value={mandate} onChange={(e) => setMandate(e.target.value)} />
            </div>
            <Button onClick={onboard} className="w-full">
              Register agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Request</CardTitle>
              <span className="text-xs text-muted-foreground">
                {agent.id} · ${agent.mandateUsd.toFixed(2)} mandate
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tool</Label>
                <select
                  value={toolId}
                  onChange={(e) => {
                    setToolId(e.target.value);
                    setSubmit({ phase: "idle" });
                  }}
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {tools.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Requested spend (USDC)</Label>
                <Input
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setSubmit({ phase: "idle" });
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Run probe on /payment-lab · grant ERC-7715 on /permissions · server executes x402 pay.
              </p>
              {!tool && tools.length === 0 && (
                <p className="text-xs text-muted-foreground">Loading tools…</p>
              )}
              <div className="flex gap-2">
                <Button onClick={runClearance} className="flex-1" disabled={submit.phase === "pending" || submit.phase === "paying"}>
                  {submit.phase === "pending" ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1" /> Checking…
                    </>
                  ) : (
                    "Ask Clearance402"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAgent(null);
                    setSubmit({ phase: "idle" });
                  }}
                >
                  Switch agent
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Decision</CardTitle>
              {(submit.phase === "done" || submit.phase === "paid") && (
                <ClearanceBadge state={submit.phase === "paid" ? "ALLOW" : submit.decision.state} />
              )}
            </CardHeader>
            <CardContent>
              {submit.phase === "idle" && (
                <p className="text-sm text-muted-foreground">Submit a request to see the clearance decision.</p>
              )}
              {submit.phase === "pending" && (
                <TxPendingState title="Running clearance" description="Checking probe history and permission scope." />
              )}
              {submit.phase === "paying" && (
                <TxPendingState title="Paying via x402" description="Server session buyer settling USDC on Base Sepolia…" />
              )}
              {submit.phase === "failed" && (
                <TxFailedState title="Payment not cleared" description={submit.error} onRetry={runClearance} />
              )}
              {submit.phase === "done" && (
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold tabular-nums">{submit.decision.trust}</span>
                    <span className="text-sm text-muted-foreground">trust · {submit.decision.toolName}</span>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {submit.decision.reasons.map((r) => (
                      <li key={r} className="flex gap-2">
                        <span className="text-muted-foreground">·</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                  {(submit.decision.state === "ALLOW" || submit.decision.state === "WARN") && (
                    <Button className="w-full" onClick={payIfCleared}>
                      Pay if cleared (server x402)
                    </Button>
                  )}
                </div>
              )}
              {submit.phase === "paid" && (
                <div className="space-y-3 text-sm">
                  <p className="text-chain-success font-medium">Payment settled and recorded in audit log.</p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {submit.paymentProof.slice(0, 120)}…
                  </p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                    {submit.responsePreview}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </ConsoleShell>
  );
}
