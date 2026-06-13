import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClearanceBadge } from "@/components/clearance/ClearanceBadge";
import {
  useClearanceDashboard,
  useClearanceWallet,
} from "@/lib/clearance/use-clearance-account";
import { ConnectWalletPrompt } from "@/components/clearance/ConnectWalletPrompt";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Clearance402" },
      { name: "description", content: "Verified tools, blocked payments, active probes, and recent agent checks." },
    ],
  }),
  component: Page,
});

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function Page() {
  const { wallet, isConnected } = useClearanceWallet();
  const { data, isLoading, refetch, isFetching } = useClearanceDashboard(wallet);

  if (!isConnected || !wallet) {
    return (
      <ConsoleShell section="Dashboard" title="Clearance dashboard" description="Connect wallet to load your account.">
        <ConnectWalletPrompt />
      </ConsoleShell>
    );
  }

  const stats = data?.stats;
  const loading = isLoading && !data;

  return (
    <ConsoleShell
      section="Dashboard"
      title="Clearance dashboard"
      description="Live stats from probes, payments, Venice evals, and agent checks on Base Sepolia."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="size-4 animate-spin" /> : "Refresh"}
          </Button>
          <Button asChild variant="outline"><Link to="/tool-onboarding">Onboard tool</Link></Button>
          <Button asChild><Link to="/agent-clearance">Run agent check</Link></Button>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading account…
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Stat label="Verified tools" value={String(stats?.verifiedTools ?? 0)} hint="ALLOW state" />
            <Stat label="Blocked payments" value={String(stats?.blockedPayments ?? 0)} hint="Audit BLOCK events" />
            <Stat label="Avg trust" value={String(stats?.avgTrust ?? 0)} hint="Across registry" />
            <Stat label="Active probes" value={String(stats?.activeProbes ?? 0)} hint="Cached per tool" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(data?.recentTools ?? []).map((t) => (
                  <Link
                    key={t.id}
                    to="/tools/$id"
                    params={{ id: t.id }}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.vendor} · {t.price}</p>
                    </div>
                    <ClearanceBadge state={t.state} />
                  </Link>
                ))}
                {(data?.recentTools ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No tools yet — onboard one or run probes.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(data?.recentActivity ?? []).map((e) => (
                  <div key={e.id} className="text-xs border-b border-border/50 pb-2 last:border-0">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{e.kind}</span>
                      <span className="text-muted-foreground">{new Date(e.time).toLocaleString()}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{e.tool} · {e.detail}</p>
                  </div>
                ))}
                {(data?.recentActivity ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </ConsoleShell>
  );
}
