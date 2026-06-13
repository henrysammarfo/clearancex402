import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClearanceBadge } from "@/components/clearance/ClearanceBadge";
import { SCORE_LABELS, type ScoreKey } from "@/lib/clearance/tools";
import { clearanceApi } from "@/lib/clearance/clearance-api";
import {
  useClearanceTool,
  useClearanceWallet,
  useInvalidateClearanceAccount,
} from "@/lib/clearance/use-clearance-account";
import { ConnectWalletPrompt } from "@/components/clearance/ConnectWalletPrompt";

export const Route = createFileRoute("/tools/$id")({
  head: () => ({
    meta: [
      { title: "Trust card · Clearance402" },
      { name: "description", content: "Trust card: score, endpoint health, price integrity, output checks, and integration snippets." },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { wallet, isConnected } = useClearanceWallet();
  const { data: tool, isLoading, refetch } = useClearanceTool(wallet, id);
  const invalidate = useInvalidateClearanceAccount();
  const [probing, setProbing] = useState(false);

  const runProbe = async () => {
    if (!tool || !wallet) return;
    setProbing(true);
    try {
      await clearanceApi.probe(wallet, { toolId: tool.id, pay: true, runVenice: true });
      invalidate(wallet);
      await refetch();
    } finally {
      setProbing(false);
    }
  };

  if (!isConnected || !wallet) {
    return (
      <ConsoleShell section="Trust card" title="Tool trust card" description="Connect wallet to view tool details.">
        <ConnectWalletPrompt />
      </ConsoleShell>
    );
  }

  if (isLoading && !tool) {
    return (
      <ConsoleShell section="Trust card" title="Loading…">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </ConsoleShell>
    );
  }

  if (!tool) {
    return (
      <ConsoleShell section="Trust card" title="Not found">
        <p className="text-sm text-muted-foreground">Tool not found.</p>
        <Button asChild className="mt-4"><Link to="/tools">Back to registry</Link></Button>
      </ConsoleShell>
    );
  }

  const scoreKeys = Object.keys(tool.scores) as ScoreKey[];

  return (
    <ConsoleShell
      section="Trust card"
      title={tool.name}
      description={`${tool.vendor} · ${tool.category} · ${tool.protocol}`}
      actions={
        <>
          <Button variant="outline" asChild><Link to="/tools">Back</Link></Button>
          <Button variant="outline" onClick={runProbe} disabled={probing}>
            {probing ? <Loader2 className="size-4 animate-spin" /> : "Re-probe"}
          </Button>
          <Button asChild><Link to="/agent-clearance">Check before payment</Link></Button>
        </>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Clearance summary</CardTitle>
              <ClearanceBadge state={tool.state} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-5">{tool.description}</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl font-semibold tabular-nums">{tool.trust}</div>
                  <div className="text-xs text-muted-foreground">Trust score / 100</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold tabular-nums">{tool.latencyMs}<span className="text-base">ms</span></div>
                  <div className="text-xs text-muted-foreground">Median latency</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold tabular-nums">{tool.uptime}<span className="text-base">%</span></div>
                  <div className="text-xs text-muted-foreground">Uptime · last probe {tool.lastProbe}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Trust score dimensions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {scoreKeys.map((k) => (
                <div key={k}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{SCORE_LABELS[k]}</span>
                    <span className="tabular-nums text-muted-foreground">{tool.scores[k]}</span>
                  </div>
                  <Progress value={tool.scores[k]} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Live status checks</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {(tool.checks ?? []).map((c) => (
                <div key={c.label} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.detail}</p>
                  </div>
                  <ClearanceBadge state={c.state} className="shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Endpoint</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="URL" value={tool.endpoint} mono />
              <Row label="Protocol" value={tool.protocol} />
              <Row label="Category" value={tool.category} />
              <Row label="Price" value={tool.price} />
              <Row label="Network" value={tool.network} />
            </CardContent>
          </Card>
        </div>
      </div>
    </ConsoleShell>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</span>
    </div>
  );
}
