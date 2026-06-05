import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, LockedState, TxPendingState, SuccessState, TxFailedState } from "@/components/states";
import { useConnection } from "@/lib/connection";
import { useLineStackCdr } from "@/lib/cdr/use-linestack-cdr";
import { ensureCdrWasm } from "@/lib/cdr/ensure-wasm";
import { parseVaultUuid, writeSecretToVault } from "@line-stack/cdr-core";
import { appendQuerylineAudit } from "@/lib/queryline/registry";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useQuerylineRegistry } from "@/lib/queryline/use-queryline-registry";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  buildDatasetSeedPayload,
  DEMO_SEED_ROWS_JSON,
} from "@/lib/queryline/demo-seed-rows";

export const Route = createFileRoute("/queryline/datasets/$id")({
  head: ({ params }) => ({ meta: [{ title: `Queryline · Dataset ${params.id}` }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { datasets, templates: allTemplates, ready, syncing, error } = useQuerylineRegistry();
  const dataset = datasets.find((d) => d.id === id);
  const templates = allTemplates.filter((t) => t.datasetId === id);
  const { config, isConnected, walletAddress, isWrongChain } = useConnection();
  const { clients, readOnly } = useLineStackCdr(config);
  const [seedPhase, setSeedPhase] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [seedError, setSeedError] = useState<string | null>(null);
  const [seedJson, setSeedJson] = useState(DEMO_SEED_ROWS_JSON);

  async function seedDataset() {
    if (!dataset || !walletAddress || !clients?.client) return;
    if (dataset.owner.toLowerCase() !== walletAddress.toLowerCase()) {
      setSeedError("Only the dataset owner can seed rows.");
      setSeedPhase("failed");
      return;
    }
    const uuid = parseVaultUuid(dataset.cdrUuid);
    if (uuid === null) return;

    setSeedPhase("pending");
    setSeedError(null);
    try {
      await ensureCdrWasm();
      const payload = new TextEncoder().encode(
        JSON.stringify(buildDatasetSeedPayload(dataset.id, dataset.schemaJson, seedJson)),
      );
      const { txHash } = await writeSecretToVault(clients.client, { uuid, secret: payload });
      await appendQuerylineAudit({
        actor: walletAddress,
        action: "queryline.dataset.seed",
        target: dataset.cdrUuid,
        txHash,
        status: "success",
      });
      setSeedPhase("success");
    } catch (e) {
      setSeedError(e instanceof Error ? e.message : String(e));
      setSeedPhase("failed");
    }
  }

  if (!ready) {
    return (
      <AppShell product="queryline" title="Loading dataset">
        <EmptyState title="Loading" description="Fetching shared registry…" />
      </AppShell>
    );
  }

  if (!dataset) {
    return (
      <AppShell product="queryline" title="Dataset not found">
        <EmptyState
          title="Unknown dataset"
          description={`No dataset "${id}" in the shared registry. Refresh from dashboard or create one.`}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      product="queryline"
      title={dataset.name}
      description={dataset.description || "CDR-backed confidential dataset."}
      actions={
        <Button asChild>
          <Link to="/queryline/request-query" search={{ datasetId: id }}>
            Request query
          </Link>
        </Button>
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Schema</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono overflow-auto max-h-64 p-3 rounded-md bg-muted">
                {dataset.schemaJson}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Publisher: seed encrypted rows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Publisher writes encrypted rows into the dataset vault via CDR (real Story tx). Edit the JSON below —
                EU region with two rows yields <code className="text-xs">avg_value: 40</code> after fulfill.
              </p>
              <div className="space-y-2">
                <Label>Seed rows (JSON)</Label>
                <Textarea
                  className="font-mono text-xs min-h-[180px]"
                  value={seedJson}
                  onChange={(e) => setSeedJson(e.target.value)}
                  spellCheck={false}
                />
              </div>
              <Button
                onClick={seedDataset}
                disabled={!isConnected || isWrongChain || readOnly || seedPhase === "pending"}
              >
                Seed sample rows (CDR write)
              </Button>
              {seedPhase === "pending" && <TxPendingState description="Writing encrypted dataset snapshot…" />}
              {seedPhase === "success" && (
                <SuccessState title="Dataset seeded" description={`Vault ${dataset.cdrUuid} updated.`} />
              )}
              {seedPhase === "failed" && (
                <TxFailedState error={seedError ?? "Seed failed"} onRetry={() => setSeedPhase("idle")} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Allowed query templates ({templates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <EmptyState
                  title="No templates"
                  action={
                    <Button asChild size="sm" variant="outline">
                      <Link to="/queryline/query-templates">Register template</Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="text-sm space-y-2">
                  {templates.map((t) => (
                    <li key={t.id}>
                      <span className="font-medium">{t.name}</span>
                      <span className="text-muted-foreground"> — {t.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <aside>
          <LockedState
            title="Raw dataset locked"
            description={`CDR UUID ${dataset.cdrUuid}. Buyers never read this vault directly — only result vaults after fulfillment.`}
          />
        </aside>
      </div>
    </AppShell>
  );
}
