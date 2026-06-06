import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConsoleShell, PreviewNote } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClearanceBadge } from "@/components/clearance/ClearanceBadge";
import { TOOLS } from "@/lib/clearance/sample";

export const Route = createFileRoute("/agent-clearance")({
  head: () => ({
    meta: [
      { title: "Agent clearance · Clearance402" },
      { name: "description", content: "An agent asks whether a tool is safe to pay. Get ALLOW, WARN, BLOCK, RETEST, or HUMAN_APPROVAL_REQUIRED." },
    ],
  }),
  component: Page,
});

function Page() {
  const [toolId, setToolId] = useState(TOOLS[0].id);
  const [amount, setAmount] = useState("0.010");
  const [checked, setChecked] = useState(false);
  const tool = TOOLS.find((t) => t.id === toolId)!;

  const reasons: Record<string, string[]> = {
    ALLOW: ["Valid 402 challenge + receipt", "Advertised price matches payment requirement", "Output matches declared schema", "Spend within agent mandate"],
    WARN: ["Tool works but latency is high", "New listing with limited probe history", "Confidence below preferred threshold"],
    BLOCK: ["Price mismatch vs on-chain requirement", "Returned output does not match schema", "Risk score above blocking threshold"],
    RETEST: ["Probe is stale", "Recent behavior changed shape", "Re-run clearance before payment"],
    HUMAN_APPROVAL_REQUIRED: ["Spend exceeds the agent mandate", "High-value purchase needs manual sign-off"],
  };

  return (
    <ConsoleShell
      section="Agent clearance"
      title="Agent clearance check"
      description="x402 lets agents pay. Clearance402 tells them what is safe to pay for."
    >
      <PreviewNote>Decisions shown are derived from the sample registry. Live checks run real probes and permission scope validation in the implementation phase.</PreviewNote>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tool</Label>
              <select
                value={toolId}
                onChange={(e) => { setToolId(e.target.value); setChecked(false); }}
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              >
                {TOOLS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Requested spend (USDC)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Agent ID</Label>
              <Input defaultValue="buyer-agent" />
            </div>
            <Button onClick={() => setChecked(true)} className="w-full">Ask Clearance402</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Decision</CardTitle>
            {checked && <ClearanceBadge state={tool.state} />}
          </CardHeader>
          <CardContent>
            {!checked ? (
              <p className="text-sm text-muted-foreground">Submit a request to see the clearance decision and reasons.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tabular-nums">{tool.trust}</span>
                  <span className="text-sm text-muted-foreground">trust score for {tool.name}</span>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Reasons</p>
                  <ul className="space-y-1.5 text-sm">
                    {(reasons[tool.state] ?? []).map((r) => (
                      <li key={r} className="flex gap-2"><span className="text-muted-foreground">·</span>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
