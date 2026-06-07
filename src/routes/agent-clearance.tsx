import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { ConsoleShell, PreviewNote } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClearanceBadge, type ClearanceState } from "@/components/clearance/ClearanceBadge";
import { TxFailedState, TxPendingState } from "@/components/states";
import { TOOLS } from "@/lib/clearance/sample";

export const Route = createFileRoute("/agent-clearance")({
  head: () => ({
    meta: [
      { title: "Agent clearance · Clearance402" },
      { name: "description", content: "Onboard an agent, then ask whether a tool is safe to pay. Get ALLOW, WARN, BLOCK, RETEST, or HUMAN_APPROVAL_REQUIRED." },
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
  | { phase: "done"; decision: Decision }
  | { phase: "failed"; error: string };

const REASONS: Record<ClearanceState, string[]> = {
  ALLOW: ["Valid 402 challenge + receipt", "Advertised price matches payment requirement", "Output matches declared schema", "Spend within agent mandate"],
  WARN: ["Tool works but latency is high", "New listing with limited probe history", "Confidence below preferred threshold"],
  BLOCK: ["Price mismatch vs on-chain requirement", "Returned output does not match schema", "Risk score above blocking threshold"],
  RETEST: ["Probe is stale", "Recent behavior changed shape", "Re-run clearance before payment"],
  HUMAN_APPROVAL_REQUIRED: ["Spend exceeds the agent mandate", "High-value purchase needs manual sign-off"],
};

function parseUsd(price: string): number {
  const m = price.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

function Page() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentName, setAgentName] = useState("buyer-agent");
  const [mandate, setMandate] = useState("5.00");

  const [toolId, setToolId] = useState(TOOLS[0].id);
  const [amount, setAmount] = useState("0.010");
  const [submit, setSubmit] = useState<SubmitState>({ phase: "idle" });

  const tool = TOOLS.find((t) => t.id === toolId)!;

  const onboard = () => {
    const m = parseFloat(mandate);
    if (!agentName.trim() || Number.isNaN(m) || m <= 0) return;
    setAgent({ id: agentName.trim(), mandateUsd: m });
  };

  const runClearance = async () => {
    if (!agent) return;
    setSubmit({ phase: "pending" });

    // Simulate the real probe + verification round-trip.
    await new Promise((r) => setTimeout(r, 1100));

    const requested = parseUsd(amount);
    if (Number.isNaN(requested) || requested <= 0) {
      setSubmit({ phase: "failed", error: "Requested spend is not a valid USDC amount." });
      return;
    }

    // A BLOCK tool surfaces a real failure state for the submission.
    if (tool.state === "BLOCK") {
      setSubmit({
        phase: "failed",
        error: "Clearance returned BLOCK — payment was refused. Price/output integrity checks failed.",
      });
      return;
    }

    // Spend over the mandate escalates to human approval regardless of tool score.
    const overMandate = requested > agent.mandateUsd;
    const state: ClearanceState = overMandate ? "HUMAN_APPROVAL_REQUIRED" : tool.state;

    setSubmit({
      phase: "done",
      decision: {
        state,
        trust: tool.trust,
        toolName: tool.name,
        reasons: overMandate
          ? [`Requested $${requested.toFixed(3)} exceeds the $${agent.mandateUsd.toFixed(2)} mandate for ${agent.id}`, ...REASONS.HUMAN_APPROVAL_REQUIRED]
          : REASONS[state],
      },
    });
  };

  return (
    <ConsoleShell
      section="Agent clearance"
      title="Agent clearance check"
      description="x402 lets agents pay. Clearance402 tells them what is safe to pay for."
    >
      <PreviewNote>
        Decisions are derived from the sample registry and your agent mandate. Live checks run real probes and permission-scope
        validation in the implementation phase.
      </PreviewNote>

      {!agent ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand" /> Onboard an agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Register an agent identity and a spend mandate. Clearance402 enforces the mandate on every check before a payment is
              allowed.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Agent ID</Label>
              <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="buyer-agent" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Spend mandate (USDC)</Label>
              <Input value={mandate} onChange={(e) => setMandate(e.target.value)} placeholder="5.00" />
            </div>
            <Button onClick={onboard} className="w-full" disabled={!agentName.trim() || !(parseFloat(mandate) > 0)}>
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
                  onChange={(e) => { setToolId(e.target.value); setSubmit({ phase: "idle" }); }}
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {TOOLS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Requested spend (USDC)</Label>
                <Input value={amount} onChange={(e) => { setAmount(e.target.value); setSubmit({ phase: "idle" }); }} />
              </div>
              <div className="flex gap-2">
                <Button onClick={runClearance} className="flex-1" disabled={submit.phase === "pending"}>
                  {submit.phase === "pending" ? <><Loader2 className="size-4 animate-spin mr-1" /> Checking…</> : "Ask Clearance402"}
                </Button>
                <Button variant="outline" onClick={() => { setAgent(null); setSubmit({ phase: "idle" }); }}>
                  Switch agent
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Decision</CardTitle>
              {submit.phase === "done" && <ClearanceBadge state={submit.decision.state} />}
            </CardHeader>
            <CardContent>
              {submit.phase === "idle" && (
                <p className="text-sm text-muted-foreground">Submit a request to see the clearance decision and reasons.</p>
              )}
              {submit.phase === "pending" && (
                <TxPendingState title="Running clearance" description="Probing the endpoint and validating the payment requirement and mandate." />
              )}
              {submit.phase === "failed" && (
                <TxFailedState title="Payment not cleared" description={submit.error} onRetry={runClearance} />
              )}
              {submit.phase === "done" && (
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold tabular-nums">{submit.decision.trust}</span>
                    <span className="text-sm text-muted-foreground">trust score for {submit.decision.toolName}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Reasons</p>
                    <ul className="space-y-1.5 text-sm">
                      {submit.decision.reasons.map((r) => (
                        <li key={r} className="flex gap-2"><span className="text-muted-foreground">·</span>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </ConsoleShell>
  );
}
