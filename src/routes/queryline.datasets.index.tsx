import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useQuerylineRegistry } from "@/lib/queryline/use-queryline-registry";

export const Route = createFileRoute("/queryline/datasets/")({
  head: () => ({ meta: [{ title: "Queryline · Datasets" }] }),
  component: Page,
});

function Page() {
  const { datasets, syncing, error } = useQuerylineRegistry();

  return (
    <AppShell
      product="queryline"
      title="Datasets"
      description="Confidential datasets on the shared Cipherline registry (same data on any device when you connect the same wallet)."
      actions={
        <Button asChild>
          <Link to="/queryline/create-dataset">New dataset</Link>
        </Button>
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />

      {datasets.length === 0 ? (
        <EmptyState
          title="No datasets"
          description="Create a dataset vault to begin allowing queries against it."
          action={
            <Button asChild variant="outline">
              <Link to="/queryline/create-dataset">Create dataset</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {datasets.map((d) => (
            <Card key={d.id}>
              <CardHeader>
                <CardTitle className="text-sm">{d.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="text-muted-foreground line-clamp-2">{d.description || "—"}</p>
                <p className="font-mono text-xs">CDR {d.cdrUuid}</p>
                <Link
                  to="/queryline/datasets/$id"
                  params={{ id: d.id }}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent"
                >
                  View
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
