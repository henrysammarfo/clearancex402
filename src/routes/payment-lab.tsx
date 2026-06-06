import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConsoleShell, PreviewNote } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/payment-lab")({
  head: () => ({
    meta: [
      { title: "Payment lab · Clearance402" },
      { name: "description", content: "Real-ready x402 flow: request resource, 402 challenge, fulfill payment, retry, receive resource, store receipt." },
    ],
  }),
  component: Page,
});

const STEPS = [
  { label: "GET resource", detail: "Agent requests the paid endpoint without payment" },
  { label: "402 Payment Required", detail: "Server returns the x402 challenge with payment requirements" },
  { label: "Fulfill payment", detail: "Buyer wallet settles the required amount" },
  { label: "Retry with proof", detail: "Re-request with the payment proof header" },
  { label: "200 Resource", detail: "Server returns the paid response" },
  { label: "Store receipt", detail: "Receipt + evidence written to audit" },
];

function Page() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 650));
    }
    setRunning(false);
  };

  return (
    <ConsoleShell
      section="Payment lab"
      title="x402 payment lab"
      description="Request resource → receive 402 challenge → fulfill payment → retry → receive resource → store receipt."
      actions={<Button onClick={run} disabled={running}>{running ? <><Loader2 className="size-4 animate-spin mr-1" />Running</> : "Run x402 flow"}</Button>}
    >
      <PreviewNote>Animated walkthrough of the x402 challenge/retry flow. No fake tx hashes or receipts are presented as real — live settlement connects in the implementation phase.</PreviewNote>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Flow</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-start gap-3 rounded-lg border p-3">
                <span className="mt-0.5">
                  {step > i || (!running && step === STEPS.length - 1 && i <= step) ? <CheckCircle2 className="size-5 text-chain-success" /> :
                   step === i ? <Loader2 className="size-5 animate-spin text-brand" /> :
                   <Circle className="size-5 text-muted-foreground/40" />}
                </span>
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Challenge inspector</CardTitle></CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted/50 p-4 text-xs overflow-x-auto font-mono leading-relaxed">
{`HTTP/1.1 402 Payment Required
X-PAYMENT-REQUIRED: {
  "scheme": "exact",
  "network": "base-sepolia",
  "asset": "USDC",
  "amount": "0.010",
  "payTo": "0x…",
  "resource": "/x402/vision"
}`}
            </pre>
            <p className="text-xs text-muted-foreground mt-3">
              Clearance402 confirms the advertised price matches the actual challenge before any payment is attempted.
            </p>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
