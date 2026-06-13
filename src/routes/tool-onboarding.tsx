import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { ClearanceBadge } from "@/components/clearance/ClearanceBadge";
import { clearanceApi } from "@/lib/clearance/clearance-api";
import {
  useClearanceWallet,
  useInvalidateClearanceAccount,
} from "@/lib/clearance/use-clearance-account";
import { ConnectWalletPrompt } from "@/components/clearance/ConnectWalletPrompt";
import type { EnrichedTool } from "@/lib/clearance/live-types";

export const Route = createFileRoute("/tool-onboarding")({
  head: () => ({
    meta: [
      { title: "Onboard tool · Clearance402" },
      { name: "description", content: "Enter an x402/MCP endpoint, price, and schema, then run a live clearance test." },
    ],
  }),
  component: Page,
});

type StepState = "idle" | "running" | "done" | "failed";

function Page() {
  const { wallet, isConnected } = useClearanceWallet();
  const invalidate = useInvalidateClearanceAccount();
  const [name, setName] = useState("Venice Vision API");
  const [endpoint, setEndpoint] = useState("https://api.venice.ai/x402/vision");
  const [price, setPrice] = useState("$0.010 USDC / call");
  const [network, setNetwork] = useState("Base Sepolia");
  const [description, setDescription] = useState("Image understanding x402 endpoint on Venice.");
  const [schema, setSchema] = useState('{\n  "label": "string",\n  "confidence": "number"\n}');
  const [states, setStates] = useState<Record<string, StepState>>({});
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnrichedTool | null>(null);

  const setStep = (key: string, state: StepState) =>
    setStates((p) => ({ ...p, [key]: state }));

  const runAll = async () => {
    if (!wallet) return;
    setRunning(true);
    setError(null);
    setResult(null);
    setStates({});

    try {
      setStep("register", "running");
      const data = (await clearanceApi.onboardTool(wallet, {
          name,
          endpoint,
          price,
          network,
          description,
          expectedSchema: schema,
          runProbe: true,
          runVenice: true,
        })) as {
        tool?: EnrichedTool;
        probe?: { challengeValid: boolean; paymentValid: boolean; responseValid: boolean };
        veniceEval?: { qualityScore: number; riskLabel: string };
        error?: string;
      };

      if (!data.tool) {
        setStep("register", "failed");
        throw new Error(data.error ?? "Onboarding failed");
      }
      setStep("register", "done");

      setStep("probe", "running");
      if (data.probe?.challengeValid) setStep("probe", "done");
      else {
        setStep("probe", data.probe ? "failed" : "done");
      }

      setStep("pay", "running");
      setStep("pay", data.probe?.paymentValid ? "done" : "failed");

      setStep("venice", "running");
      setStep("venice", data.veniceEval ? "done" : data.probe?.responseValid ? "failed" : "idle");

      setStep("card", "running");
      setResult(data.tool);
      setStep("card", "done");
      invalidate(wallet);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const STEPS = [
    { key: "register", label: "Register tool", detail: "Persist endpoint to live registry" },
    { key: "probe", label: "Probe endpoint", detail: "Unpaid request → confirm 402 challenge" },
    { key: "pay", label: "Run x402 test", detail: "Server wallet pays on Base Sepolia" },
    { key: "venice", label: "Venice evaluation", detail: "Output quality, drift, risk label" },
    { key: "card", label: "Generate Trust Card", detail: "Live score + status checks" },
  ];

  if (!isConnected || !wallet) {
    return (
      <ConsoleShell section="Onboard tool" title="Developer onboarding" description="Connect wallet to onboard tools.">
        <ConnectWalletPrompt />
      </ConsoleShell>
    );
  }

  return (
    <ConsoleShell
      section="Onboard tool"
      title="Developer onboarding"
      description="Live clearance pipeline: register → probe → pay → Venice → trust card."
    >
      {error && <p className="text-sm text-chain-failed mb-4">{error}</p>}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Endpoint details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Tool name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Endpoint URL"><Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price"><Input value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
              <Field label="Network"><Input value={network} onChange={(e) => setNetwork(e.target.value)} /></Field>
            </div>
            <Field label="Description"><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
            <Field label="Expected output schema (JSON)">
              <Textarea rows={4} className="font-mono text-xs" value={schema} onChange={(e) => setSchema(e.target.value)} />
            </Field>
            <p className="text-xs text-muted-foreground">
              Requires server <code className="text-[11px]">WALLET_PRIVATE_KEY</code> + <code className="text-[11px]">VENICE_API_KEY</code>.
            </p>
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
                     st === "failed" ? <XCircle className="size-5 text-chain-failed" /> :
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
            {result && (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{result.name}</p>
                  <ClearanceBadge state={result.state} />
                </div>
                <p className="text-sm">Trust <strong>{result.trust}</strong> · {result.id}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/tools/$id" params={{ id: result.id }}>View trust card</Link>
                </Button>
              </div>
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
