import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClearanceBadge, type ClearanceState } from "@/components/clearance/ClearanceBadge";
import {
  useClearanceTools,
  useClearanceWallet,
} from "@/lib/clearance/use-clearance-account";
import { ConnectWalletPrompt } from "@/components/clearance/ConnectWalletPrompt";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "Tool registry · Clearance402" },
      { name: "description", content: "Verified x402 and MCP tool registry with live trust scores and clearance states." },
    ],
  }),
  component: Page,
});

const FILTERS: ("ALL" | ClearanceState)[] = ["ALL", "ALLOW", "WARN", "BLOCK", "RETEST", "HUMAN_APPROVAL_REQUIRED"];

function Page() {
  const { wallet, isConnected } = useClearanceWallet();
  const { data: tools = [], isLoading, refetch, isFetching } = useClearanceTools(wallet);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ALL" | ClearanceState>("ALL");

  if (!isConnected || !wallet) {
    return (
      <ConsoleShell section="Tool registry" title="Verified tool registry" description="Connect wallet to view your registry.">
        <ConnectWalletPrompt />
      </ConsoleShell>
    );
  }

  const filtered = tools.filter((t) => {
    const matchesText =
      t.name.toLowerCase().includes(q.toLowerCase()) ||
      t.vendor.toLowerCase().includes(q.toLowerCase()) ||
      t.category.toLowerCase().includes(q.toLowerCase());
    const matchesFilter = filter === "ALL" || t.state === filter;
    return matchesText && matchesFilter;
  });

  return (
    <ConsoleShell
      section="Tool registry"
      title="Verified tool registry"
      description="Live trust scores from x402 probes and Venice evals on Base Sepolia."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="size-4 animate-spin" /> : "Refresh"}
          </Button>
          <Button asChild><Link to="/tool-onboarding">Onboard tool</Link></Button>
        </div>
      }
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input placeholder="Search by name, vendor, category…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f ? "bg-foreground text-background border-foreground" : "bg-background hover:bg-accent"
              }`}
            >
              {f === "HUMAN_APPROVAL_REQUIRED" ? "HUMAN" : f}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground mb-4">Loading live registry…</p>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <Link key={t.id} to="/tools/$id" params={{ id: t.id }} className="block">
            <Card className="h-full transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.vendor} · {t.category}</p>
                  </div>
                  <ClearanceBadge state={t.state} />
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate mb-4">{t.endpoint}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-semibold tabular-nums">{t.trust}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Trust</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold tabular-nums">{t.latencyMs || "—"}{t.latencyMs ? "ms" : ""}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Latency</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold tabular-nums">{t.probe ? "✓" : "—"}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Probed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No tools match — onboard one or run a probe.</p>
      )}
    </ConsoleShell>
  );
}
