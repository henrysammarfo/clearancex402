import { createFileRoute, Link } from "@tanstack/react-router";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClearanceBadge } from "@/components/clearance/ClearanceBadge";
import { TOOLS, AUDIT } from "@/lib/clearance/sample";

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
  const allow = TOOLS.filter((t) => t.state === "ALLOW").length;
  const blocked = TOOLS.filter((t) => t.state === "BLOCK").length;
  const avgTrust = Math.round(TOOLS.reduce((s, t) => s + t.trust, 0) / TOOLS.length);

  return (
    <ConsoleShell
      section="Dashboard"
      title="Clearance dashboard"
      description="Before your agent pays, it gets clearance. Verified tools, blocked payments, active probes, and recent agent checks across x402 and MCP services."
      actions={
        <>
          <Button asChild variant="outline"><Link to="/tool-onboarding">Onboard tool</Link></Button>
          <Button asChild><Link to="/agent-clearance">Run agent check</Link></Button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Verified tools" value={String(allow)} hint="Currently cleared ALLOW" />
        <Stat label="Blocked payments" value={String(blocked)} hint="Stopped before spend" />
        <Stat label="Avg trust score" value={`${avgTrust}`} hint="Across registry" />
        <Stat label="Active probes" value="3" hint="Live verification running" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Recently checked tools</CardTitle>
            <Link to="/tools" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {TOOLS.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <Link to="/tools/$id" params={{ id: t.id }} className="font-medium truncate hover:underline">
                      {t.name}
                    </Link>
                    <p className="text-xs text-muted-foreground font-mono truncate">{t.endpoint}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground tabular-nums">{t.trust}</span>
                    <ClearanceBadge state={t.state} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Recent activity</CardTitle>
            <Link to="/audit" className="text-xs text-muted-foreground hover:text-foreground">Audit log</Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {AUDIT.slice(0, 6).map((e) => (
                <li key={e.id} className="text-sm">
                  <p className="font-medium">
                    <span className="text-muted-foreground font-mono text-[11px] mr-2">{e.kind}</span>
                    {e.tool !== "—" ? e.tool : e.detail}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{e.tool !== "—" ? e.detail : `by ${e.actor}`}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
