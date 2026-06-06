import { createFileRoute, Link } from "@tanstack/react-router";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClearanceBadge } from "@/components/clearance/ClearanceBadge";
import { getTool, SCORE_LABELS, type ScoreKey } from "@/lib/clearance/sample";

export const Route = createFileRoute("/tools/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${getTool(params.id)?.name ?? "Trust card"} · Clearance402` },
      { name: "description", content: "Trust card: score, endpoint health, price integrity, output checks, and integration snippets." },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const tool = getTool(id);

  if (!tool) {
    return (
      <ConsoleShell section="Trust card" title="Tool not found">
        <p className="text-sm text-muted-foreground">No tool with id <span className="font-mono">{id}</span>.</p>
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
            <CardHeader><CardTitle className="text-sm">Integration snippet</CardTitle></CardHeader>
            <CardContent>
              <pre className="rounded-lg bg-muted/50 p-4 text-xs overflow-x-auto font-mono leading-relaxed">
{`import { clearance402 } from "@clearance402/sdk";

const decision = await clearance402.checkBeforePayment({
  agentId: "buyer-agent",
  toolId: "${tool.id}",
  amount: "${tool.price}",
});

if (decision.state === "ALLOW") {
  await clearance402.payIfCleared("${tool.id}", ctx);
}`}
              </pre>
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
