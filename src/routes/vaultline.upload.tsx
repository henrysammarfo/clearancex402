import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileLock2, Loader2, UploadCloud, X } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  NotConnectedState,
  SuccessState,
  TxFailedState,
  TxPendingState,
} from "@/components/states";
import { cn } from "@/lib/utils";
import { useConnection } from "@/lib/connection";
import { useLineStackCdr } from "@/lib/cdr/use-linestack-cdr";
import { ensureCdrWasm } from "@/lib/cdr/ensure-wasm";
import {
  explorerTxUrl,
  fileVaultUploadConditions,
  mapUnknownError,
  ON_CHAIN_SECRET_HINT_BYTES,
  parseVaultUuid,
  uploadEncryptedFile,
  writeSecretToVault,
} from "@line-stack/cdr-core";
import { createFileStorageProvider } from "@/lib/storage/resolve-file-storage";
import {
  addVaultFileAndNotify,
  appendAuditAndNotify,
  getIpAssetForVault,
  getVault,
  type VaultFileRecord,
} from "@/lib/vault/registry";
import { resolveVaultCdrUuid } from "@/lib/vault/resolve-vault-cdr";
import { rememberLastVaultId, readLastVaultId } from "@/lib/vault/last-vault";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { TxFlowActions } from "@/components/tx/TxFlowActions";
import { VaultSelect } from "@/components/vault/VaultSelect";
import { useVaultlineRegistry } from "@/lib/vault/use-vaultline-registry";

type Phase = "pending" | "validating" | "encrypting" | "ready" | "committed" | "failed";
type Row = {
  id: string;
  name: string;
  size: number;
  mime: string;
  phase: Phase;
  progress: number;
  error?: string;
  txHash?: string;
};

/** Conservative pre-check before we query chain max size (on-chain secret path). */
const ON_CHAIN_HINT_BYTES = ON_CHAIN_SECRET_HINT_BYTES;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const ALLOWED = /^(text\/|application\/(json|pdf|zip|x-parquet|x-ndjson)|image\/)/;

export const Route = createFileRoute("/vaultline/upload")({
  validateSearch: z.object({
    vaultId: z.string().optional(),
    fileId: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Vaultline · Upload" }] }),
  component: Page,
});

function registryFileToRow(f: VaultFileRecord): Row {
  return {
    id: f.id,
    name: f.name,
    size: f.size,
    mime: f.mime,
    phase: "committed",
    progress: 100,
    txHash: f.writeTxHash,
  };
}

function fmt(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function validate(file: File): string | null {
  if (file.size === 0) return "File is empty.";
  if (file.size > MAX_FILE_BYTES) return `File exceeds ${fmt(MAX_FILE_BYTES)} limit.`;
  if (file.type && !ALLOWED.test(file.type)) return `Unsupported MIME type: ${file.type}.`;
  return null;
}

function Page() {
  const navigate = useNavigate();
  const { vaultId: vaultIdSearch, fileId: searchFileId } = Route.useSearch();
  const { registryKey: vaultId, cdrUuid: parsedVaultUuid } = resolveVaultCdrUuid(vaultIdSearch);
  const { config, isConnected, isWrongChain, walletAddress } = useConnection();
  const { clients, readOnly } = useLineStackCdr(config);
  const { vaults, files: registryFiles, ready: registryReady, syncing, error: registryError } =
    useVaultlineRegistry();
  const [rows, setRows] = useState<Row[]>([]);
  const [drag, setDrag] = useState(false);
  const [commitState, setCommitState] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [commitError, setCommitError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [lastUploadedFileId, setLastUploadedFileId] = useState<string | null>(null);
  const [lastStorageKind, setLastStorageKind] = useState<VaultFileRecord["storageKind"] | null>(null);
  const fileRefs = useRef<Map<string, File>>(new Map());
  const hydratedFromRegistry = useRef(false);

  const myVaults = useMemo(() => {
    if (!walletAddress) return vaults;
    const w = walletAddress.toLowerCase();
    return vaults.filter((v) => v.owner.toLowerCase() === w);
  }, [vaults, walletAddress]);

  const vaultMeta = vaultId ? getVault(vaultId) : undefined;

  const needsOnChainVaultUuid = useMemo(
    () =>
      rows.some((r) => {
        if (r.phase !== "ready") return false;
        const f = fileRefs.current.get(r.id);
        return f != null && f.size <= ON_CHAIN_HINT_BYTES;
      }),
    [rows],
  );
  const cdrUuidLabel = parsedVaultUuid != null ? String(parsedVaultUuid) : null;
  const vaultFiles = vaultId
    ? [...registryFiles.filter((f) => f.vaultUuid === vaultId)].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      )
    : [];

  useEffect(() => {
    if (vaultIdSearch || !registryReady) return;
    const last = readLastVaultId();
    if (last) {
      navigate({ to: "/vaultline/upload", search: { vaultId: last }, replace: true });
    }
  }, [vaultIdSearch, registryReady, navigate]);

  useEffect(() => {
    if (vaultId) rememberLastVaultId(vaultId);
  }, [vaultId]);

  useEffect(() => {
    if (!registryReady || !vaultId || hydratedFromRegistry.current) return;
    if (vaultFiles.length === 0) return;

    const pick =
      (searchFileId ? vaultFiles.find((f) => f.id === searchFileId) : undefined) ??
      vaultFiles[0];
    if (!pick) return;

    hydratedFromRegistry.current = true;
    setLastTxHash(pick.writeTxHash);
    setLastUploadedFileId(pick.id);
    setLastStorageKind(pick.storageKind);
    setCommitState("success");
    setRows((prev) => {
      const withoutDup = prev.filter(
        (r) => !(pick.writeTxHash && r.txHash === pick.writeTxHash && r.name === pick.name),
      );
      if (withoutDup.some((r) => r.id === pick.id)) return withoutDup;
      return [registryFileToRow(pick), ...withoutDup];
    });
  }, [registryReady, vaultId, searchFileId, vaultFiles]);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const added: Row[] = Array.from(files).map((f) => {
      const err = validate(f);
      const id = crypto.randomUUID();
      if (!err) fileRefs.current.set(id, f);
      return {
        id,
        name: f.name,
        size: f.size,
        mime: f.type || "application/octet-stream",
        phase: (err ? "failed" : "ready") as Phase,
        progress: err ? 0 : 100,
        error: err ?? undefined,
      };
    });
    setRows((prev) => [...prev, ...added]);
  }, []);

  const remove = (id: string) => {
    fileRefs.current.delete(id);
    setRows((p) => p.filter((x) => x.id !== id));
  };

  const submit = async () => {
    setCommitError(null);
    setLastTxHash(null);

    if (!vaultId) {
      setCommitError("Select a vault first — create one, then pick it from the dropdown above.");
      return;
    }
    if (needsOnChainVaultUuid && parsedVaultUuid === null) {
      setCommitError(
        `Vault "${vaultMeta?.name ?? vaultIdSearch}" needs a numeric CDR UUID for small on-chain files. Create a new vault, or upload only larger files (IPFS) which allocate their own CDR vault.`,
      );
      return;
    }
    if (!isConnected || !walletAddress) {
      setCommitError("Connect your wallet on Story Aeneid (1315) to commit.");
      return;
    }
    if (isWrongChain) {
      setCommitError("Switch your wallet to Story Aeneid Testnet (chain ID 1315).");
      return;
    }
    if (readOnly || !clients?.client) {
      setCommitError("Wallet client not ready — reconnect and retry.");
      return;
    }

    const readyRows = rows.filter((r) => r.phase === "ready");
    if (readyRows.length === 0) return;

    setCommitState("pending");
    try {
      await ensureCdrWasm();
      let finalTxHash: string | null = null;
      let fileStorage: Awaited<ReturnType<typeof createFileStorageProvider>> | null = null;

      for (const row of readyRows) {
        const file = fileRefs.current.get(row.id);
        if (!file) {
          setRows((p) =>
            p.map((x) =>
              x.id === row.id ? { ...x, phase: "failed", error: "File reference lost — re-add the file." } : x,
            ),
          );
          continue;
        }

        setRows((p) =>
          p.map((x) => (x.id === row.id ? { ...x, phase: "encrypting", progress: 20 } : x)),
        );

        const bytes = new Uint8Array(await file.arrayBuffer());
        const useOffChain = file.size > ON_CHAIN_HINT_BYTES;
        const ipAsset = vaultId ? getIpAssetForVault(vaultId) : undefined;
        const useLicenseRead = Boolean(ipAsset?.ipId);
        const owner = walletAddress as `0x${string}`;
        const ipId = ipAsset?.ipId as `0x${string}` | undefined;
        const fileConditions = fileVaultUploadConditions({
          owner,
          ipId,
          licenseGated: useLicenseRead,
        });
        let txHash: string;
        let cdrUuid: string;
        let cid: string | undefined;
        let storageKind: "on-chain-secret" | "ipfs-file";

        if (useOffChain) {
          if (!fileStorage) {
            fileStorage = await createFileStorageProvider();
          }
          setRows((p) =>
            p.map((x) => (x.id === row.id ? { ...x, progress: 45 } : x)),
          );
          const uploaded = await uploadEncryptedFile(clients.client, {
            content: bytes,
            storageProvider: fileStorage,
            ...fileConditions,
          });
          txHash = uploaded.txHash;
          cdrUuid = String(uploaded.uuid);
          cid = uploaded.cid;
          storageKind = "ipfs-file";
        } else {
          setRows((p) =>
            p.map((x) => (x.id === row.id ? { ...x, progress: 60 } : x)),
          );
          const written = await writeSecretToVault(clients.client, {
            uuid: parsedVaultUuid,
            secret: bytes,
          });
          txHash = written.txHash;
          cdrUuid = String(parsedVaultUuid);
          storageKind = "on-chain-secret";
        }

        finalTxHash = txHash;
        const fileId = crypto.randomUUID();
        setLastUploadedFileId(fileId);
        setLastStorageKind(storageKind);
        rememberLastVaultId(vaultId);
        navigate({
          to: "/vaultline/upload",
          search: { vaultId, fileId },
          replace: true,
        });

        await addVaultFileAndNotify({
          id: fileId,
          vaultUuid: vaultId,
          cdrUuid,
          storageKind,
          readCondition: useOffChain && useLicenseRead ? "license" : "owner",
          ipId: useLicenseRead ? ipAsset?.ipId : undefined,
          cid,
          name: file.name,
          size: file.size,
          mime: file.type || "application/octet-stream",
          writeTxHash: txHash,
          uploadedAt: new Date().toISOString(),
        });

        await appendAuditAndNotify({
          actor: walletAddress,
          action: useOffChain ? "vault.uploadFile" : "vault.write",
          target: `${vaultId}/${file.name}`,
          txHash,
          status: "success",
        });

        setRows((p) =>
          p.map((x) =>
            x.id === row.id ? { ...x, phase: "committed", progress: 100, txHash } : x,
          ),
        );
        fileRefs.current.delete(row.id);
      }

      if (finalTxHash) {
        setLastTxHash(finalTxHash);
        setCommitState("success");
        setRows((p) => {
          const committed = p.filter((r) => r.phase === "committed");
          const seen = new Set<string>();
          return committed.filter((r) => {
            if (!r.txHash) return true;
            const key = `${r.name}::${r.txHash}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        });
      } else {
        setCommitState("failed");
        setCommitError("No files were committed — fix failed rows and retry.");
      }
    } catch (err) {
      const mapped = mapUnknownError(err);
      setCommitError(mapped.message);
      setCommitState("failed");
      setRows((p) =>
        p.map((x) =>
          x.phase === "encrypting" ? { ...x, phase: "ready" as Phase, progress: 100 } : x,
        ),
      );
      await appendAuditAndNotify({
        actor: walletAddress ?? "unknown",
        action: "vault.write",
        target: vaultId ?? "unknown",
        txHash: "—",
        status: "failed",
      });
    }
  };

  const displayRows = useMemo(() => {
    const seen = new Set<string>();
    return rows.filter((r) => {
      if (!r.txHash) return true;
      const key = `${r.name}::${r.txHash}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rows]);

  const validCount = displayRows.filter((r) => r.phase === "ready" || r.phase === "committed" || r.phase === "encrypting").length;
  const failedCount = displayRows.filter((r) => r.phase === "failed").length;
  const canCommit = Boolean(
    vaultId &&
      validCount > 0 &&
      commitState !== "pending" &&
      (!needsOnChainVaultUuid || parsedVaultUuid !== null),
  );

  useEffect(() => {
    if (!vaultIdSearch) {
      setCommitError(null);
      return;
    }
    if (!registryReady) return;
    if (needsOnChainVaultUuid && parsedVaultUuid === null) {
      setCommitError(
        `Vault "${vaultMeta?.name ?? vaultIdSearch}" has no numeric CDR UUID for on-chain uploads. Use larger files (IPFS) or create a new vault with a numeric UUID.`,
      );
    } else {
      setCommitError(null);
    }
  }, [vaultIdSearch, parsedVaultUuid, vaultMeta?.name, registryReady, needsOnChainVaultUuid]);

  const explorerBase = config?.explorerBaseUrl ?? "https://aeneid.storyscan.io/tx/";
  const successDescription =
    lastStorageKind === "ipfs-file" || lastStorageKind === "storacha-file"
      ? "Encrypted file stored on IPFS with a dedicated CDR file vault. Test unlock with your publisher wallet (before IP register). Files >1 KB need a working IPFS proxy."
      : "On-chain secret written to vault UUID. Test unlock with your publisher wallet (works immediately, no IPFS).";

  return (
    <AppShell
      product="vaultline"
      title="Upload to vault"
      description={
        vaultId
          ? vaultMeta
            ? `Upload into "${vaultMeta.name}" (CDR UUID ${cdrUuidLabel ?? "?"}). ≤${fmt(ON_CHAIN_HINT_BYTES)} on-chain; larger files use IPFS + CDR uploadFile.`
            : `Upload into vault ${cdrUuidLabel ?? vaultId}. ≤${fmt(ON_CHAIN_HINT_BYTES)} on-chain; larger files use IPFS (VPS) or Storacha fallback.`
          : "Create a vault first, then upload files (small on-chain or large via Storacha)."
      }
    >
      <RegistrySyncBanner syncing={syncing} error={registryError} />

      <div className="mb-6 max-w-md">
        <VaultSelect
          vaults={myVaults}
          value={vaultIdSearch ?? ""}
          syncing={syncing}
          onChange={(id) => {
            hydratedFromRegistry.current = false;
            navigate({ to: "/vaultline/upload", search: { vaultId: id }, replace: true });
          }}
        />
        {vaultId && parsedVaultUuid === null && (
          <p className="text-xs text-muted-foreground mt-2">
            Large files (IPFS) work without a parent vault UUID. Small on-chain files need a numeric CDR vault —{" "}
            <Link to="/vaultline/create-vault" className="underline">
              create vault
            </Link>
            .
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
            className={cn(
              "rounded-2xl border-2 border-dashed p-10 text-center bg-card transition-colors",
              drag ? "border-vault bg-vault/5" : "border-border",
              !vaultId && "opacity-60 pointer-events-none",
            )}
          >
            <UploadCloud className="size-8 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">Drop files here or browse</p>
            <p className="text-sm text-muted-foreground mt-1">
              ≤{fmt(ON_CHAIN_HINT_BYTES)} on-chain secret · up to {fmt(MAX_FILE_BYTES)} via IPFS · text, JSON, PDF, Parquet, ZIP, image
            </p>
            <label className="inline-block mt-4">
              <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              <span className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-zinc-900 text-white text-sm cursor-pointer">Browse files</span>
            </label>
          </div>

          <div className="mt-6 rounded-2xl border bg-card">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-semibold">File status</h3>
              <span className="text-xs text-muted-foreground">
                {displayRows.length} file{displayRows.length === 1 ? "" : "s"} · {validCount} ready · {failedCount} failed
              </span>
            </div>
            {displayRows.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No files added yet.</div>
            ) : (
              <ul className="divide-y">
                {displayRows.map((r) => (
                  <li key={r.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileLock2 className="size-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{fmt(r.size)} · {r.mime}</p>
                      </div>
                      <PhaseBadge phase={r.phase} />
                      <button onClick={() => remove(r.id)} className="size-7 rounded-md hover:bg-muted flex items-center justify-center"><X className="size-3.5" /></button>
                    </div>
                    {(r.phase === "encrypting" || r.phase === "ready") && r.phase === "encrypting" && (
                      <div className="mt-2 flex items-center gap-3">
                        <Progress value={r.progress} className="h-1.5" />
                        <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-right">{Math.round(r.progress)}%</span>
                      </div>
                    )}
                    {r.phase === "failed" && (
                      <p className="mt-2 text-xs text-chain-failed">{r.error ?? "Validation failed."}</p>
                    )}
                    {r.txHash && (
                      <p className="mt-2 text-[11px] text-muted-foreground font-mono truncate">
                        Tx: {r.txHash.slice(0, 14)}…
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button type="button" disabled={!canCommit} onClick={submit}>
              {commitState === "pending" ? "Committing…" : "Commit upload tx"}
            </Button>
            <p className="text-xs text-muted-foreground">Encrypts client-side, then signs a CDR write on Story Aeneid.</p>
          </div>

          {commitError && commitState !== "pending" && (
            <p className="mt-3 text-sm text-chain-failed">{commitError}</p>
          )}

          {commitState === "pending" && (
            <div className="mt-6">
              <TxPendingState description="Encrypting and submitting CDR write to Story Aeneid…" />
              <TxFlowActions
                phase="pending"
                pendingHint="Large files: MetaMask may prompt twice (allocate file vault + write). On-chain small files: one write."
                onCancel={() => {
                  setCommitState("idle");
                  setRows((p) =>
                    p.map((x) =>
                      x.phase === "encrypting"
                        ? { ...x, phase: "ready" as Phase, progress: 100 }
                        : x,
                    ),
                  );
                }}
              />
            </div>
          )}
          {commitState === "failed" && commitError && (
            <div className="mt-6">
              <TxFailedState
                error={commitError}
                onRetry={() => {
                  setCommitState("idle");
                  setRows((p) =>
                    p.map((x) =>
                      x.phase === "encrypting" ? { ...x, phase: "ready" as Phase, progress: 100 } : x,
                    ),
                  );
                }}
              />
            </div>
          )}
          {commitState === "success" && lastTxHash && (
            <div className="mt-6">
              <SuccessState
                title="Upload committed on-chain"
                description={successDescription}
                txHash={lastTxHash}
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <a href={explorerTxUrl(explorerBase, lastTxHash)} target="_blank" rel="noreferrer">
                        View on Storyscan
                      </a>
                    </Button>
                    <Button asChild size="sm">
                      <Link to="/vaultline/unlock" search={{ vaultId, fileId: lastUploadedFileId ?? undefined }}>
                        Test unlock
                      </Link>
                    </Button>
                    {vaultId && (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/vaultline/vaults/$uuid" params={{ uuid: vaultId }}>
                          Vault detail
                        </Link>
                      </Button>
                    )}
                  </div>
                }
              />
            </div>
          )}
          {!isConnected && vaultId && (
            <div className="mt-6"><NotConnectedState description="Connect a wallet on Story Aeneid to encrypt and commit files." /></div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h4 className="text-sm font-semibold mb-2">Phases</h4>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li><span className="inline-block size-1.5 rounded-full bg-muted-foreground mr-2" /> ready — validated, awaiting wallet commit</li>
              <li><span className="inline-block size-1.5 rounded-full bg-chain-pending mr-2" /> encrypting — CDR encrypt + write tx</li>
              <li><span className="inline-block size-1.5 rounded-full bg-chain-success mr-2" /> committed — on-chain write confirmed</li>
              <li><span className="inline-block size-1.5 rounded-full bg-chain-failed mr-2" /> failed — fix and re-add</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-5 text-xs text-muted-foreground">
            Files ≤{fmt(ON_CHAIN_HINT_BYTES)} write to your vault UUID. Larger files use encrypted IPFS (configure IPFS_PROXY_* on server — docs/IPFS-VPS.md).
          </div>
          {vaultId && vaultFiles.length > 0 && (
            <div className="rounded-2xl border bg-card p-5">
              <h4 className="text-sm font-semibold mb-2">Saved in registry</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Persists across refresh — shared Cipherline registry.
              </p>
              <ul className="space-y-2">
                {vaultFiles.map((f) => (
                  <li key={f.id} className="text-xs">
                    <p className="font-medium truncate">{f.name}</p>
                    <p className="text-muted-foreground font-mono">
                      CDR {f.cdrUuid} · {f.storageKind}
                    </p>
                    <Link
                      to="/vaultline/unlock"
                      search={{ vaultId, fileId: f.id }}
                      className="text-[#4f46e5] font-medium hover:underline mt-1 inline-block"
                    >
                      Unlock →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

function PhaseBadge({ phase }: { phase: Phase }) {
  const map: Record<Phase, { icon: React.ReactNode; cls: string; label: string }> = {
    pending: { icon: <Loader2 className="size-3 animate-spin" />, cls: "bg-muted text-muted-foreground", label: "pending" },
    validating: { icon: <Loader2 className="size-3 animate-spin" />, cls: "bg-muted text-muted-foreground", label: "validating" },
    encrypting: { icon: <Loader2 className="size-3 animate-spin" />, cls: "bg-chain-pending/15 text-foreground border border-chain-pending/40", label: "encrypting" },
    ready: { icon: <CheckCircle2 className="size-3" />, cls: "bg-chain-success/15 text-foreground border border-chain-success/40", label: "ready" },
    committed: { icon: <CheckCircle2 className="size-3" />, cls: "bg-chain-success/15 text-foreground border border-chain-success/40", label: "committed" },
    failed: { icon: <AlertTriangle className="size-3" />, cls: "bg-chain-failed/15 text-foreground border border-chain-failed/40", label: "failed" },
  };
  const m = map[phase];
  return <span className={cn("inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full capitalize", m.cls)}>{m.icon}{m.label}</span>;
}
