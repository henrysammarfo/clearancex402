import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useQuerylineRegistry } from "@/lib/queryline/use-queryline-registry";

export const Route = createFileRoute("/queryline/results/")({
  head: () => ({ meta: [{ title: "Queryline · Results" }] }),
  component: Page,
});

function Page() {
  const { requests, syncing, error } = useQuerylineRegistry();
  const completed = requests.filter((r) => r.status === "completed" && r.resultCdrUuid);

  return (
    <AppShell
      product="queryline"
      title="Result vaults"
      description="Completed queries with CDR result vaults. Open a result, then unlock as the buyer wallet."
      actions={
        <Button asChild>
          <Link to="/queryline/request-query">New query</Link>
        </Button>
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />
      {completed.length === 0 ? (
        <EmptyState
          title="No result vaults"
          description="Submit a query, then have the publisher fulfill it from the dashboard."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {completed.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="text-sm">Result {r.id.slice(0, 8)}…</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="font-mono text-xs">CDR {r.resultCdrUuid}</p>
                <p className="text-muted-foreground">Buyer {r.buyer.slice(0, 12)}…</p>
                <Link
                  to="/queryline/results/$id"
                  params={{ id: r.id }}
                  className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Open &amp; unlock
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
