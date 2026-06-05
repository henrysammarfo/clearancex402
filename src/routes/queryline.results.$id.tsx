import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Download, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LockedState,
  NotConnectedState,
  SuccessState,
  TxFailedState,
  TxPendingState,
  UnauthorizedState,
} from "@/components/states";
import { useConnection } from "@/lib/connection";
import { useLineStackCdr } from "@/lib/cdr/use-linestack-cdr";
import { ensureCdrWasm } from "@/lib/cdr/ensure-wasm";
import {
  CDRError,
  explorerTxUrl,
  mapUnknownError,
  parseVaultUuid,
  readSecretFromVault,
} from "@line-stack/cdr-core";
import { appendQuerylineAudit } from "@/lib/queryline/registry";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useQuerylineRegistry } from "@/lib/queryline/use-queryline-registry";

export const Route = createFileRoute("/queryline/results/$id")({
  head: ({ params }) => ({ meta: [{ title: `Queryline · Result ${params.id}` }] }),
  component: Page,
});

type View = "idle" | "decrypting" | "success" | "failed" | "not-connected" | "unauthorized";

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Page() {
  const { id } = Route.useParams();
  const { requests, ready, syncing, error: registryError } = useQuerylineRegistry();
  const request = requests.find((r) => r.id === id);
  const { config, isConnected, isWrongChain, walletAddress } = useConnection();
  const { clients, readOnly } = useLineStackCdr(config);
  const [view, setView] = useState<View>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [answerJson, setAnswerJson] = useState<string | null>(null);

  async function unlock() {
    setError(null);
    setAnswerJson(null);
    if (!request?.resultCdrUuid) {
      setError("Request has no result vault.");
      setView("failed");
      return;
    }
    if (!isConnected || !walletAddress) {
      setView("not-connected");
      return;
    }
    if (isWrongChain || readOnly || !clients?.client) {
      setView("failed");
      setError("Connect wallet on Aeneid.");
      return;
    }
    if (request.buyer.toLowerCase() !== walletAddress.toLowerCase()) {
      setView("unauthorized");
      setError("Only the requesting buyer can unlock this result vault.");
      return;
    }
    if (request.status !== "completed") {
      setError("Publisher has not fulfilled this request yet.");
      setView("failed");
      return;
    }

    const uuid = parseVaultUuid(request.resultCdrUuid);
    if (uuid === null) {
      setError("Invalid result vault UUID.");
      setView("failed");
      return;
    }

    setView("decrypting");
    try {
      await ensureCdrWasm();
      const { data, txHash: readTx } = await readSecretFromVault(clients.client, {
        uuid,
        timeoutMs: 120_000,
      });
      const text = new TextDecoder().decode(data);
      setAnswerJson(text);
      setTxHash(readTx);
      setView("success");
      await appendQuerylineAudit({
        actor: walletAddress,
        action: "queryline.result.unlock",
        target: request.resultCdrUuid,
        txHash: readTx,
        status: "success",
      });
    } catch (err) {
      const mapped = mapUnknownError(err);
      setError(mapped.message);
      if (err instanceof CDRError) {
        const code = (err as CDRError & { code?: string }).code;
        if (code === "ACCESS_DENIED" || code === "EMPTY_VAULT") {
          setView("unauthorized");
          return;
        }
      }
      setView("failed");
    }
  }

  if (!request) {
    return (
      <AppShell product="queryline" title="Result not found">
        <p className="text-sm text-muted-foreground">Unknown request id {id}.</p>
      </AppShell>
    );
  }

  const explorerBase = config?.explorerBaseUrl ?? "https://aeneid.storyscan.io/tx/";

  return (
    <AppShell
      product="queryline"
      title={`Result vault ${request.resultCdrUuid ?? id}`}
      description="Unlock runs real CDR accessCDR — answer only, never the publisher dataset."
    >
      <RegistrySyncBanner syncing={syncing} error={registryError} />
      <div className="grid lg:grid-cols-[1fr_420px] gap-6 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm">Result metadata</CardTitle>
            <ShieldCheck className="size-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="text-xs space-y-2 min-w-0">
            <Row label="Status" value={request.status} />
            <Row label="CDR UUID" value={request.resultCdrUuid ?? "—"} mono />
            <Row label="Buyer" value={request.buyer} mono />
            <Row
              label="Params"
              value={
                <pre className="font-mono text-[10px] whitespace-pre-wrap break-all max-h-24 overflow-auto p-2 bg-muted rounded">
                  {request.paramsJson}
                </pre>
              }
            />
            {request.attestation && (
              <>
                <Row label="Attestation" value="Publisher EIP-712 binding" />
                <Row label="Signer" value={request.attestation.signer} mono />
                <Row label="Binding" value={request.attestation.bindingHash} mono />
                {request.attestation.automata?.txHash && (
                  <Row
                    label="Automata DCAP (on-chain)"
                    value={
                      <a
                        href={`${explorerBase}${request.attestation.automata.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline break-all"
                      >
                        {request.attestation.automata.txHash}
                      </a>
                    }
                  />
                )}
                {request.attestation.automata?.success === true && (
                  <Row label="TEE verify" value="Intel DCAP quote verified on Aeneid (Automata)" />
                )}
              </>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-4 min-w-0">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm">Unlock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={unlock} disabled={view === "decrypting"}>
                Unlock result (CDR)
              </Button>
              {view === "decrypting" && <TxPendingState description="accessCDR on result vault…" />}
              {view === "not-connected" && <NotConnectedState />}
              {view === "unauthorized" && (
                <UnauthorizedState
                  reason={
                    error ??
                    `Connect the buyer wallet (${request.buyer.slice(0, 10)}…) — you are ${walletAddress?.slice(0, 10) ?? "not connected"}…`
                  }
                />
              )}
              {view === "failed" && <TxFailedState error={error ?? "Failed"} onRetry={() => setView("idle")} />}
              {view === "success" && answerJson && txHash && (
                <SuccessState
                  title="Answer decrypted"
                  description="JSON answer from result vault."
                  txHash={txHash}
                  action={
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => downloadText(answerJson, `query-result-${id}.json`)}>
                        <Download className="size-4 mr-1" /> Download
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <a href={explorerTxUrl(explorerBase, txHash)} target="_blank" rel="noreferrer">
                          Tx
                        </a>
                      </Button>
                    </div>
                  }
                />
              )}
              {answerJson && view === "success" && (
                <pre className="text-[10px] font-mono max-h-48 overflow-auto p-2 bg-muted rounded whitespace-pre-wrap break-all">
                  {answerJson}
                </pre>
              )}
            </CardContent>
          </Card>
          <LockedState title="Dataset locked" description="Raw dataset vault is never exposed to buyers." />
        </aside>
      </div>
    </AppShell>
  );
}

function Row({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-muted-foreground mb-0.5">{label}</div>
      <div className={mono ? "font-mono break-all text-foreground" : "break-words text-foreground"}>{value}</div>
    </div>
  );
}
