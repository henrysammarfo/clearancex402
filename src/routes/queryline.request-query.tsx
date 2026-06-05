import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LockedState, NotConnectedState, SuccessState, TxFailedState, TxPendingState } from "@/components/states";
import { useConnection } from "@/lib/connection";
import { useLineStackCdr } from "@/lib/cdr/use-linestack-cdr";
import { ensureCdrWasm } from "@/lib/cdr/ensure-wasm";
import { mapUnknownError } from "@line-stack/cdr-core";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useQuerylineRegistry } from "@/lib/queryline/use-queryline-registry";
import { addRequest, appendQuerylineAudit } from "@/lib/queryline/registry";
import { linestackResultVaultAllocateConditions } from "@/lib/cdr/linestack-allocate";
import { isTemplateActiveOnChain, contractsReady } from "@/lib/contracts/linestack-registry";

export const Route = createFileRoute("/queryline/request-query")({
  validateSearch: z.object({ datasetId: z.string().optional() }),
  head: () => ({ meta: [{ title: "Queryline · Request query" }] }),
  component: Page,
});

function Page() {
  const { datasetId: initialDatasetId } = Route.useSearch();
  const { datasets, templates: allTemplates, syncing, error: registryError } = useQuerylineRegistry();
  const { config, isConnected, isWrongChain, walletAddress } = useConnection();
  const { clients, readOnly } = useLineStackCdr(config);
  const [datasetId, setDatasetId] = useState(initialDatasetId ?? "");
  const [templateId, setTemplateId] = useState("");
  const [paramsJson, setParamsJson] = useState('{ "region": "EU" }');
  const [phase, setPhase] = useState<"idle" | "pending" | "success" | "failed" | "not-connected">("idle");
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const templates = datasetId ? allTemplates.filter((t) => t.datasetId === datasetId) : [];
  const dataset = datasetId ? datasets.find((d) => d.id === datasetId) : undefined;

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isConnected || !walletAddress) {
      setPhase("not-connected");
      return;
    }
    if (isWrongChain || readOnly || !clients?.client) {
      setError("Connect wallet on Aeneid.");
      setPhase("failed");
      return;
    }
    if (!dataset || !templateId) {
      setError("Select dataset and template.");
      setPhase("failed");
      return;
    }
    try {
      JSON.parse(paramsJson);
    } catch {
      setError("Params must be valid JSON.");
      setPhase("failed");
      return;
    }

    if (
      contractsReady() &&
      clients?.publicClient &&
      /^0x[a-fA-F0-9]{64}$/.test(templateId)
    ) {
      const active = await isTemplateActiveOnChain(
        clients.publicClient,
        templateId as `0x${string}`,
      );
      if (!active) {
        setError("Template is not active on-chain. Re-register or pick another template.");
        setPhase("failed");
        return;
      }
    }

    setPhase("pending");
    try {
      await ensureCdrWasm();
      const owner = dataset.owner as `0x${string}`;
      const buyer = walletAddress as `0x${string}`;
      const cond = linestackResultVaultAllocateConditions(owner, buyer);
      const { uuid, txHash } = await clients.client.uploader.allocate({
        updatable: false,
        ...cond,
      });

      const id = crypto.randomUUID();
      await addRequest({
        id,
        datasetId: dataset.id,
        templateId,
        buyer,
        paramsJson,
        status: "pending",
        resultCdrUuid: String(uuid),
        resultVaultAllocateTx: txHash,
        createdAt: new Date().toISOString(),
      });
      await appendQuerylineAudit({
        actor: buyer,
        action: "queryline.request",
        target: String(uuid),
        txHash,
        status: "success",
      });
      setRequestId(id);
      setPhase("success");
    } catch (err) {
      setError(mapUnknownError(err).message);
      setPhase("failed");
    }
  }

  return (
    <AppShell
      product="queryline"
      title="Request a query"
      description="Allocates a per-buyer result vault on CDR. The publisher fulfills by writing the answer; you unlock only that result."
    >
      <RegistrySyncBanner syncing={syncing} error={registryError} />
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Query request</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submitRequest}>
              <div className="space-y-2">
                <Label>Dataset</Label>
                <Select value={datasetId} onValueChange={(v) => { setDatasetId(v); setTemplateId(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={templateId} onValueChange={setTemplateId} disabled={!datasetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Params (JSON)</Label>
                <Textarea className="font-mono text-xs" rows={4} value={paramsJson} onChange={(e) => setParamsJson(e.target.value)} />
              </div>
              <Button type="submit" disabled={phase === "pending"}>
                Submit request (allocate result vault)
              </Button>
            </form>
            {phase === "pending" && <TxPendingState className="mt-4" description="Allocating result vault on CDR…" />}
            {phase === "not-connected" && <NotConnectedState />}
            {phase === "failed" && <TxFailedState className="mt-4" error={error ?? "Failed"} onRetry={() => setPhase("idle")} />}
            {phase === "success" && requestId && (
              <div className="mt-4">
                <SuccessState
                  title="Request submitted"
                  description="Publisher must fulfill by writing the query answer to your result vault."
                  action={
                    <Button asChild size="sm">
                      <Link to="/queryline/dashboard">View dashboard</Link>
                    </Button>
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
        <aside>
          <LockedState title="Raw dataset stays locked" description="You only receive the result vault UUID after this tx confirms." />
        </aside>
      </div>
    </AppShell>
  );
}
