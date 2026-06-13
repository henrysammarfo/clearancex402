import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clearanceApi } from "@/lib/clearance/clearance-api";
import {
  useClearanceTools,
  useClearanceWallet,
  useInvalidateClearanceAccount,
} from "@/lib/clearance/use-clearance-account";
import { ConnectWalletPrompt } from "@/components/clearance/ConnectWalletPrompt";

export const Route = createFileRoute("/venice-eval")({
  head: () => ({
    meta: [
      { title: "Venice eval · Clearance402" },
      { name: "description", content: "Venice evaluation of output quality, drift, and risk." },
    ],
  }),
  component: Page,
});

function Page() {
  const { wallet, isConnected } = useClearanceWallet();
  const { data: tools = [] } = useClearanceTools(wallet);
  const invalidate = useInvalidateClearanceAccount();
  const [toolId, setToolId] = useState("venice-chat");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    qualityScore: number;
    driftScore: number;
    riskLabel: string;
    summary: string;
  } | null>(null);

  const run = async () => {
    if (!wallet) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = (await clearanceApi.veniceEval(wallet, { toolId })) as {
        evaluation?: typeof result;
      };
      if (data.evaluation) setResult(data.evaluation);
      invalidate(wallet);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || !wallet) {
    return (
      <ConsoleShell section="Venice eval" title="Venice evaluation" description="Connect wallet first.">
        <ConnectWalletPrompt />
      </ConsoleShell>
    );
  }

  return (
    <ConsoleShell
      section="Venice eval"
      title="Venice evaluation"
      description="Evaluates probe output against tool claims — quality, drift, and risk labels."
      actions={
        <Button onClick={run} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-1" /> Evaluating…
            </>
          ) : (
            "Evaluate with Venice"
          )}
        </Button>
      }
    >
      {error && <p className="text-sm text-chain-failed mb-4">{error}</p>}

      <Card className="max-w-lg mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={toolId}
            onChange={(e) => setToolId(e.target.value)}
          >
            {tools.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.probe ? "· probed" : "· no probe"}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-2">
            Run a probe on <Link to="/payment-lab" className="underline">Payment lab</Link> first so Venice has output.
          </p>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Quality: <strong>{result.qualityScore}</strong> · Drift:{" "}
              <strong>{result.driftScore.toFixed(2)}</strong> · Risk:{" "}
              <strong>{result.riskLabel}</strong>
            </p>
            <p className="text-muted-foreground">{result.summary}</p>
          </CardContent>
        </Card>
      )}
    </ConsoleShell>
  );
}
