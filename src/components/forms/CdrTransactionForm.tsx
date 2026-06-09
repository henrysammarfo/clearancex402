import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NotConnectedState,
  SuccessState,
  TxFailedState,
  TxPendingState,
  UnauthorizedState,
} from "@/components/states";
import { useConnection } from "@/lib/connection";
import { useLineStackCdr } from "@/lib/cdr/use-linestack-cdr";
import { ensureCdrWasm } from "@/lib/cdr/ensure-wasm";
import { explorerTxUrl, mapUnknownError } from "@line-stack/cdr-core";
import { TxFlowActions } from "@/components/tx/TxFlowActions";

type Phase = "idle" | "pending" | "success" | "failed" | "not-connected" | "wrong-chain";

export function CdrTransactionForm({
  label,
  pendingLabel,
  children,
  onValidate,
  onExecute,
  successTitle = "Transaction confirmed",
  buildSuccessDescription,
  onSuccess,
}: {
  label: string;
  pendingLabel: string;
  children: React.ReactNode;
  onValidate?: () => string | null;
  onExecute: (ctx: {
    uploader: NonNullable<ReturnType<typeof useLineStackCdr>["clients"]>["client"]["uploader"];
    address: `0x${string}`;
    walletClient?: NonNullable<ReturnType<typeof useLineStackCdr>["clients"]>["walletClient"];
    publicClient?: NonNullable<ReturnType<typeof useLineStackCdr>["clients"]>["publicClient"];
  }) => Promise<{ txHash: string; data?: Record<string, string> }>;
  successTitle?: string;
  buildSuccessDescription?: (result: { txHash: string; data?: Record<string, string> }) => string;
  onSuccess?: (result: { txHash: string; data?: Record<string, string> }) => void;
}) {
  const { config, isConnected, isWrongChain, walletAddress } = useConnection();
  const { clients, readOnly } = useLineStackCdr(config);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, string> | undefined>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTxHash(null);
    setExtra(undefined);

    const validationError = onValidate?.();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!isConnected || !walletAddress) {
      setPhase("not-connected");
      return;
    }
    if (isWrongChain) {
      setPhase("wrong-chain");
      return;
    }
    if (readOnly || !clients?.client.uploader) {
      setPhase("not-connected");
      return;
    }

    setPhase("pending");
    try {
      await ensureCdrWasm();
      const result = await onExecute({
        uploader: clients.client.uploader,
        address: walletAddress as `0x${string}`,
        walletClient: clients.walletClient,
        publicClient: clients.publicClient,
      });
      setTxHash(result.txHash);
      setExtra(result.data);
      setPhase("success");
      onSuccess?.({ txHash: result.txHash, data: result.data });
    } catch (err) {
      const mapped = mapUnknownError(err);
      setError(mapped.message);
      setPhase("failed");
    }
  }

  const explorerBase = config?.explorerBaseUrl ?? "https://aeneid.storyscan.io/tx/";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">{children}</div>
      {error && phase === "idle" && <p className="text-sm text-chain-failed">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={phase === "pending"}>
          {phase === "pending" ? pendingLabel : label}
        </Button>
      </div>

      {phase === "pending" && (
        <>
          <TxPendingState description={pendingLabel} />
          <TxFlowActions
            phase="pending"
            pendingHint="Confirm in MetaMask, or cancel to stop waiting."
            onCancel={() => setPhase("idle")}
          />
        </>
      )}
      {phase === "not-connected" && <NotConnectedState />}
      {phase === "wrong-chain" && (
        <UnauthorizedState
          title="Wrong network"
          reason="Switch your wallet to the configured Clearance402 network, then retry."
        />
      )}
      {phase === "failed" && (
        <TxFailedState error={error ?? "Transaction failed"} onRetry={() => setPhase("idle")} />
      )}
      {phase === "success" && txHash && (
        <SuccessState
          title={successTitle}
          description={
            buildSuccessDescription?.({ txHash, data: extra }) ??
            "Clearance402 transaction confirmed."
          }
          txHash={txHash}
          action={
            <Button asChild size="sm" variant="outline">
              <a href={explorerTxUrl(explorerBase, txHash)} target="_blank" rel="noreferrer">
                View transaction
              </a>
            </Button>
          }
        />
      )}
    </form>
  );
}
