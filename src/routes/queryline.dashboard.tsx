import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardWalletActions } from "@/components/wallet/DashboardWalletActions";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, TxPendingState, TxFailedState } from "@/components/states";
import { AuditLogTable } from "@/components/tables/AuditLogTable";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useQuerylineRegistry } from "@/lib/queryline/use-queryline-registry";
import { useConnection } from "@/lib/connection";
import { useLineStackCdr } from "@/lib/cdr/use-linestack-cdr";
import { useWalletClient, usePublicClient } from "wagmi";
import {
  buildFulfillAttestationMessage,
  signFulfillAttestationBrowser,
} from "@/lib/queryline/attest-fulfill";
import { browserAutomataAttestation } from "@/lib/queryline/automata-browser";
import { ensureCdrWasm } from "@/lib/cdr/ensure-wasm";
import { parseVaultUuid, readSecretFromVault, writeSecretToVault } from "@line-stack/cdr-core";
import { executeTemplateOnDataset, type DatasetPayload } from "@/lib/queryline/execute-template";
import {
  appendQuerylineAudit,
  updateRequest,
} from "@/lib/queryline/registry";

export const Route = createFileRoute("/queryline/dashboard")({
  head: () => ({ meta: [{ title: "Queryline · Dashboard" }] }),
  component: Page,
});

function Page() {
  const { datasets, templates, requests, audit, ready, syncing, error } = useQuerylineRegistry();
  const { config, walletAddress } = useConnection();
  const { clients } = useLineStackCdr(config);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const w = walletAddress?.toLowerCase();

  const myDatasets = useMemo(() => {
    if (!w) return datasets;
    return datasets.filter((d) => d.owner.toLowerCase() === w);
  }, [datasets, w]);

  const myTemplates = useMemo(() => {
    const ids = new Set(myDatasets.map((d) => d.id));
    return templates.filter((t) => ids.has(t.datasetId));
  }, [templates, myDatasets]);

  const pending = useMemo(() => {
    if (!w) return requests.filter((r) => r.status === "pending");
    return requests.filter((r) => {
      if (r.status !== "pending") return false;
      const ds = datasets.find((d) => d.id === r.datasetId);
      return ds?.owner.toLowerCase() === w;
    });
  }, [requests, datasets, w]);

  const completed = useMemo(() => {
    if (!w) return requests.filter((r) => r.status === "completed");
    return requests.filter(
      (r) =>
        r.status === "completed" &&
        (r.buyer.toLowerCase() === w ||
          datasets.find((d) => d.id === r.datasetId)?.owner.toLowerCase() === w),
    );
  }, [requests, datasets, w]);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [fulfillError, setFulfillError] = useState<string | null>(null);
  const [lastFailedRequestId, setLastFailedRequestId] = useState<string | null>(null);

  async function fulfill(requestId: string) {
    const req = requests.find((r) => r.id === requestId);
    if (!req || !req.resultCdrUuid || !clients?.client || !walletAddress || !walletClient || !publicClient) return;
    const dataset = datasets.find((d) => d.id === req.datasetId);
    if (!dataset || dataset.owner.toLowerCase() !== walletAddress.toLowerCase()) {
      setFulfillError("Only the dataset owner can fulfill.");
      return;
    }
    const resultUuid = parseVaultUuid(req.resultCdrUuid);
    const datasetUuid = parseVaultUuid(dataset.cdrUuid);
    if (resultUuid === null || datasetUuid === null) return;

    setFulfillingId(requestId);
    setFulfillError(null);
    try {
      await ensureCdrWasm();
      const template =
        templates.find((t) => t.datasetId === req.datasetId && t.id === req.templateId) ??
        templates.find(
          (t) =>
            t.datasetId === req.datasetId &&
            t.name.trim().toLowerCase() === req.templateId.trim().toLowerCase(),
        );
      const params = JSON.parse(req.paramsJson) as Record<string, unknown>;

      const { data: datasetBytes } = await readSecretFromVault(clients.client, {
        uuid: datasetUuid,
        timeoutMs: 120_000,
      });
      const datasetPayload = JSON.parse(new TextDecoder().decode(datasetBytes)) as DatasetPayload;

      const computed = executeTemplateOnDataset(template?.name ?? "unknown", params, datasetPayload);
      const answer = {
        ...computed,
        computedAt: new Date().toISOString(),
        datasetCdrUuid: dataset.cdrUuid,
        resultCdrUuid: req.resultCdrUuid,
        attestationVersion: 1,
      };

      const resultJson = JSON.stringify(answer, null, 2);
      const attestationMessage = buildFulfillAttestationMessage({
        requestId,
        templateId: template?.id ?? req.templateId,
        datasetCdrUuid: dataset.cdrUuid,
        resultCdrUuid: req.resultCdrUuid,
        resultJsonUtf8: resultJson,
      });
      const attestation = await browserAutomataAttestation({
        walletClient,
        publicClient,
        stored: await signFulfillAttestationBrowser({
          walletClient,
          account: walletAddress as `0x${string}`,
          message: attestationMessage,
        }),
      });

      const bytes = new TextEncoder().encode(resultJson);
      const { txHash } = await writeSecretToVault(clients.client, { uuid: resultUuid, secret: bytes });
      await updateRequest(requestId, {
        status: "completed",
        resultWriteTx: txHash,
        completedAt: new Date().toISOString(),
        attestation,
      });
      await appendQuerylineAudit({
        actor: walletAddress,
        action: "queryline.fulfill",
        target: requestId,
        txHash,
        status: "success",
      });
    } catch (e) {
      setLastFailedRequestId(requestId);
      setFulfillError(e instanceof Error ? e.message : String(e));
    } finally {
      setFulfillingId(null);
    }
  }

  return (
    <AppShell
      product="queryline"
      title="Queryline dashboard"
      description="Licensed answers over private datasets (shared registry). Publisher: fulfill pending requests. Buyer: unlock result vaults only."
      actions={
        <>
          <DashboardWalletActions />
          <Button asChild variant="outline">
            <Link to="/queryline/create-dataset">New dataset</Link>
          </Button>
          <Button asChild>
            <Link to="/queryline/request-query">New query</Link>
          </Button>
        </>
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />

      <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground mb-6 max-w-3xl">
        <strong className="text-foreground">Problem:</strong> buyers need answers from private data without seeing raw rows.
        <strong className="text-foreground"> Solution:</strong> dataset vault (publisher-only) + per-buyer result vault + allow-listed templates.
      </div>

      <p className="text-xs text-muted-foreground mb-4 max-w-3xl">
        Shared registry: marketplace stats include all testers. Counts below filter by your connected wallet where noted.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Your datasets", String(myDatasets.length)],
          ["Your templates", String(myTemplates.length)],
          ["Pending (you publish)", String(pending.length)],
          ["Results (you buyer/publish)", String(completed.length)],
        ].map(([l, v]) => (
          <Card key={l}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{l}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending requests (publisher)</CardTitle>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <EmptyState title="No pending queries" />
            ) : (
              <ul className="text-sm space-y-3">
                {pending.map((r) => (
                  <li key={r.id} className="border rounded-md p-3 space-y-2">
                    <p className="font-mono text-xs">result vault {r.resultCdrUuid}</p>
                    <p className="text-muted-foreground">buyer {r.buyer.slice(0, 10)}…</p>
                    <Button
                      size="sm"
                      onClick={() => fulfill(r.id)}
                      disabled={fulfillingId === r.id}
                    >
                      Fulfill (CDR + EIP-712 + Automata)
                    </Button>
                    {fulfillingId === r.id && (
                      <TxPendingState description="CDR write + EIP-712 sign + Automata DCAP on-chain…" />
                    )}
                  </li>
                ))}
              </ul>
            )}
            {fulfillError && lastFailedRequestId && (
              <TxFailedState
                className="mt-2"
                error={fulfillError}
                onRetry={() => {
                  setFulfillError(null);
                  void fulfill(lastFailedRequestId);
                }}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Result vaults</CardTitle>
          </CardHeader>
          <CardContent>
            {completed.length === 0 ? (
              <EmptyState title="No completed results" />
            ) : (
              <ul className="text-sm space-y-2">
                {completed.map((r) => (
                  <li key={r.id}>
                    <Link className="underline" to="/queryline/results/$id" params={{ id: r.id }}>
                      Request {r.id.slice(0, 8)}… — vault {r.resultCdrUuid}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-3">Audit log</h2>
      <p className="text-xs text-muted-foreground mb-2">
        Audit filters use tx status (success / failed / pending), not the pending-requests panel above.
      </p>
      <AuditLogTable
        scope="Queryline"
        product="queryline"
        entries={audit}
        storageKey="linestack.audit.queryline.dashboard.v1"
      />
    </AppShell>
  );
}
