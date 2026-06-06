import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ConsoleShell, PreviewNote } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/tool-onboarding")({
  head: () => ({
    meta: [
      { title: "Onboard tool · Clearance402" },
      { name: "description", content: "Enter an x402/MCP endpoint, price, and schema, then run a live clearance test." },
    ],
  }),
  component: Page,
});

type StepState = "idle" | "running" | "done";
const STEPS = [
  { key: "probe", label: "Probe endpoint", detail: "Send unpaid request, confirm real 402 challenge" },
  { key: "pay", label: "Run x402 test", detail: "Pay with test buyer wallet, retry, receive paid response" },
  { key: "venice", label: "Venice evaluation", detail: "Check output matches declared description + schema" },
  { key: "card", label: "Generate Trust Card", detail: "Score, proof, and integration snippets" },
];

function Page() {
  const [states, setStates] = useState<Record<string, StepState>>({});
  const [running, setRunning] = useState(false);

  const runAll = async () => {
    setRunning(true);
    for (const s of STEPS) {
      setStates((p) => ({ ...p, [s.key]: "running" }));
      await new Promise((r) => setTimeout(r, 700));
      setStates((p) => ({ ...p, [s.key]: "done" }));
    }
    setRunning(false);
  };

  return (
    <ConsoleShell
      section="Onboard tool"
      title="Developer onboarding"
      description="Prove your paid x402 / MCP service is live, priced correctly, compatible, and agent-safe."
    >
      <PreviewNote>
        This is a frontend preview of the onboarding flow. Real probes, payments, and Venice evaluations connect during the
        implementation phase — no fake transaction hashes or success states are shown.
      </PreviewNote>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Endpoint details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Tool name"><Input placeholder="Venice Vision API" /></Field>
            <Field label="Endpoint URL"><Input placeholder="https://api.example.com/x402/resource" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price"><Input placeholder="0.010 USDC" /></Field>
              <Field label="Network"><Input placeholder="Base Sepolia" /></Field>
            </div>
            <Field label="Description"><Textarea rows={2} placeholder="What the tool does and what it returns." /></Field>
            <Field label="Expected output schema (JSON)">
              <Textarea rows={4} className="font-mono text-xs" placeholder={`{\n  "label": "string",\n  "confidence": "number"\n}`} />
            </Field>
            <Button onClick={runAll} disabled={running} className="w-full">
              {running ? <><Loader2 className="size-4 animate-spin mr-1" /> Running clearance…</> : "Run clearance test"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Clearance pipeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {STEPS.map((s) => {
              const st = states[s.key] ?? "idle";
              return (
                <div key={s.key} className="flex items-start gap-3 rounded-lg border p-3">
                  <span className="mt-0.5">
                    {st === "done" ? <CheckCircle2 className="size-5 text-chain-success" /> :
                     st === "running" ? <Loader2 className="size-5 animate-spin text-brand" /> :
                     <Circle className="size-5 text-muted-foreground/40" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.detail}</p>
                  </div>
                </div>
              );
            })}
            {STEPS.every((s) => states[s.key] === "done") && (
              <Button asChild variant="outline" className="w-full"><Link to="/tools">View in registry</Link></Button>
            )}
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
