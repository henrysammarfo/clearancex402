import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearanceApi } from "@/lib/clearance/clearance-api";
import {
  useClearanceTools,
  useClearanceWallet,
  useInvalidateClearanceAccount,
} from "@/lib/clearance/use-clearance-account";
import { ConnectWalletPrompt } from "@/components/clearance/ConnectWalletPrompt";

export const Route = createFileRoute("/payment-lab")({
  head: () => ({
    meta: [
      { title: "Payment lab · Clearance402" },
      {
        name: "description",
        content: "Live x402 flow on Base Sepolia: 402 challenge, payment, retry, resource.",
      },
    ],
  }),
  component: Page,
});

type ProbeResponse = {
  probe?: {
    httpStatus: number;
    challengeValid: boolean;
    paymentValid: boolean;
    responseValid: boolean;
    latencyMs: number;
    challengeHeaders?: Record<string, string>;
    responsePreview?: string;
    paymentProof?: string;
    error?: string;
  };
  veniceEval?: { qualityScore: number; driftScore: number; riskLabel: string; summary: string };
  error?: string;
};

function Page() {
  const { wallet, isConnected } = useClearanceWallet();
  const { data: tools = [] } = useClearanceTools(wallet);
  const invalidate = useInvalidateClearanceAccount();
  const [endpoint, setEndpoint] = useState("https://clearancex402.vercel.app/api/demo/x402");
  const [toolId, setToolId] = useState("x402-sepolia-demo");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProbeResponse | null>(null);

  if (!isConnected || !wallet) {
    return (
      <ConsoleShell section="Payment lab" title="x402 payment lab" description="Connect wallet to run probes.">
        <ConnectWalletPrompt />
      </ConsoleShell>
    );
  }

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = (await clearanceApi.probe(wallet, {
        toolId,
        endpoint,
        pay: true,
        runVenice: true,
      })) as ProbeResponse;
      setResult(data);
      invalidate(wallet);
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
    }
  };

  const p = result?.probe;

  return (
    <ConsoleShell
      section="Payment lab"
      title="x402 payment lab"
      description="Live probe on Base Sepolia — real 402 challenge, x402 settlement, Venice eval."
      actions={
        <Button onClick={run} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-1" />
              Probing…
            </>
          ) : (
            "Run live x402 probe"
          )}
        </Button>
      }
    >
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Endpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tool</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={toolId}
                onChange={(e) => {
                  const t = tools.find((x) => x.id === e.target.value);
                  setToolId(e.target.value);
                  if (t) setEndpoint(t.endpoint);
                }}
              >
                {tools.filter((t) => t.protocol === "x402").map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">URL</Label>
              <Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Requires <code className="text-[11px]">WALLET_PRIVATE_KEY</code> on the server with Base Sepolia ETH +
              test USDC.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {result?.error && <p className="text-chain-failed">{result.error}</p>}
            {!result && !loading && <p className="text-muted-foreground">Run a probe to see live results.</p>}
            {p && (
              <>
                <Row label="HTTP status" value={String(p.httpStatus)} />
                <Row label="402 challenge" value={p.challengeValid ? "valid" : "missing"} ok={p.challengeValid} />
                <Row label="Payment" value={p.paymentValid ? "settled" : "failed"} ok={p.paymentValid} />
                <Row label="Response" value={p.responseValid ? "OK" : "invalid"} ok={p.responseValid} />
                <Row label="Latency" value={`${p.latencyMs} ms`} />
                {result?.veniceEval && (
                  <Row
                    label="Venice"
                    value={`quality ${result.veniceEval.qualityScore} · ${result.veniceEval.riskLabel}`}
                  />
                )}
                {p.error && <p className="text-chain-failed text-xs">{p.error}</p>}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {p?.challengeHeaders && Object.keys(p.challengeHeaders).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">402 challenge headers</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted/50 p-4 text-xs overflow-x-auto font-mono">
              {JSON.stringify(p.challengeHeaders, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {p?.responsePreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Paid response preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted/50 p-4 text-xs overflow-x-auto font-mono max-h-64">
              {p.responsePreview}
            </pre>
          </CardContent>
        </Card>
      )}
    </ConsoleShell>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={ok === false ? "text-chain-failed font-medium" : "font-medium"}>{value}</span>
    </div>
  );
}
