import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import {
  NotConnectedState,
  SuccessState,
  TxFailedState,
  TxPendingState,
  UnauthorizedState,
} from "@/components/states";
import { Download, Unlock as UnlockIcon } from "lucide-react";
import { useConnection } from "@/lib/connection";
import { useLineStackCdr } from "@/lib/cdr/use-linestack-cdr";
import { ensureCdrWasm } from "@/lib/cdr/ensure-wasm";
import {
  CDRError,
  downloadEncryptedFile,
  encodeLicenseAccessAuxData,
  explorerTxUrl,
  mapUnknownError,
  parseVaultUuid,
  readSecretFromVault,
} from "@line-stack/cdr-core";
import { getBuyerLicenseForIp } from "@/lib/vault/buyer-licenses";
import { createBrowserIpfsProvider } from "@/lib/storage/browser-ipfs-provider";
import { createBrowserStorachaProvider } from "@/lib/storacha/browser-client";
import {
  addUnlockAndNotify,
  appendAuditAndNotify,
} from "@/lib/vault/registry";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useVaultlineRegistry } from "@/lib/vault/use-vaultline-registry";

export const Route = createFileRoute("/vaultline/unlock")({
  validateSearch: z.object({
    vaultId: z.string().optional(),
    fileId: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Vaultline · Unlock" }] }),
  component: Page,
});

type View = "idle" | "decrypting" | "success" | "failed" | "not-connected" | "wrong-chain" | "unauthorized";

function downloadBytes(bytes: Uint8Array, filename: string, mime: string) {
  const blob = new Blob([bytes], { type: mime || "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Page() {
  const { vaultId: searchVaultId, fileId: searchFileId } = Route.useSearch();
  const { config, isConnected, isWrongChain, walletAddress } = useConnection();
  const { clients, readOnly } = useLineStackCdr(config);
  const { files, listings, ready: registryReady, syncing, error: registryError } =
    useVaultlineRegistry();
  const [view, setView] = useState<View>("idle");
  const [vaultId, setVaultId] = useState(searchVaultId ?? "");
  const [fileId, setFileId] = useState(searchFileId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [decrypted, setDecrypted] = useState<{ bytes: Uint8Array; name: string; mime: string } | null>(null);

  useEffect(() => {
    if (searchVaultId) setVaultId(searchVaultId);
    if (searchFileId) setFileId(searchFileId);
  }, [searchVaultId, searchFileId]);

  const fileMeta = fileId ? files.find((f) => f.id === fileId) : undefined;

  const needsLicense =
    fileMeta?.readCondition === "license" || Boolean(fileMeta?.ipId);

  const buyerLicense =
    fileMeta?.ipId && walletAddress
      ? getBuyerLicenseForIp(fileMeta.ipId, walletAddress)
      : undefined;

  const listingForFile = useMemo(() => {
    if (!fileMeta?.ipId) return undefined;
    return listings.find((l) => l.ipId.toLowerCase() === fileMeta.ipId!.toLowerCase());
  }, [listings, fileMeta?.ipId]);

  const vaultRegistryFiles = useMemo(() => {
    if (!searchVaultId) return [];
    return files.filter((f) => f.vaultUuid === searchVaultId);
  }, [files, searchVaultId]);

  async function handleUnlock() {
    setError(null);
    setTxHash(null);
    setDecrypted(null);

    const targetUuidStr = fileMeta?.cdrUuid ?? vaultId.trim();
    const uuid = parseVaultUuid(targetUuidStr);
    if (uuid === null) {
      setError("Enter a valid numeric CDR vault UUID (or select a file from your registry).");
      setView("failed");
      return;
    }

    if (!isConnected || !walletAddress) {
      setView("not-connected");
      return;
    }
    if (isWrongChain) {
      setView("wrong-chain");
      return;
    }
    if (readOnly || !clients?.client) {
      setView("not-connected");
      return;
    }

    setView("decrypting");
    try {
      await ensureCdrWasm();
      const name = fileMeta?.name ?? `vault-${uuid}-secret.bin`;
      const mime = fileMeta?.mime ?? "application/octet-stream";
      const useFileVault =
        fileMeta?.storageKind === "storacha-file" || fileMeta?.storageKind === "ipfs-file";

      let accessAuxData: `0x${string}` = "0x";
      if (needsLicense) {
        if (!fileMeta?.ipId) {
          setError("File is license-gated but has no ipId in registry.");
          setView("failed");
          return;
        }
        const license = buyerLicense;
        if (!license) {
          setError(
            "This file is PIL license-gated. Connect the buyer wallet that minted a license for this IP (publisher wallet cannot decrypt after IP register).",
          );
          setView("unauthorized");
          return;
        }
        accessAuxData = encodeLicenseAccessAuxData([BigInt(license.licenseTokenId)]);
      }

      let data: Uint8Array;
      let readTx: string;

      if (useFileVault) {
        const storage =
          fileMeta?.storageKind === "storacha-file"
            ? await createBrowserStorachaProvider()
            : await createBrowserIpfsProvider();
        const result = await downloadEncryptedFile(clients.client, {
          uuid,
          storageProvider: storage,
          accessAuxData,
          timeoutMs: 120_000,
        });
        data = result.content;
        readTx = result.txHash;
      } else {
        const result = await readSecretFromVault(clients.client, {
          uuid,
          accessAuxData,
          timeoutMs: 120_000,
        });
        data = result.data;
        readTx = result.txHash;
      }

      setTxHash(readTx);
      setDecrypted({ bytes: data, name, mime });
      setView("success");

      await addUnlockAndNotify({
        id: crypto.randomUUID(),
        vaultUuid: String(uuid),
        fileId: fileId || fileMeta?.id || "—",
        fileName: name,
        txHash: readTx,
        unlockedAt: new Date().toISOString(),
      });

      await appendAuditAndNotify({
        actor: walletAddress,
        action: "vault.access",
        target: `${uuid}/${name}`,
        txHash: readTx,
        status: "success",
      });
    } catch (err) {
      const mapped = mapUnknownError(err);
      let message = mapped.message;
      if (/read condition not met/i.test(message)) {
        message = needsLicense
          ? "On-chain read rejected: read condition not met. Use the buyer wallet that holds the PIL license token for this IP (not the publisher). Confirm the license mint tx succeeded on Storyscan, then retry."
          : "On-chain read rejected: read condition not met. Use the vault owner wallet that created this vault.";
      } else if (/collecting partials/i.test(message) && /0\/0/.test(message)) {
        message =
          "No validator partials were returned. This usually means the CDR read tx failed on-chain first (often “read condition not met”) — fix wallet/license, then retry. Story-API may also return errors until a valid read is submitted.";
      } else if (/partial decryption submission not found/i.test(message)) {
        message =
          "CDR read did not complete on-chain, so validators never published partials. Use the buyer wallet with a minted license token, or the publisher only for files uploaded before IP register.";
      } else if (/CID integrity check failed/i.test(message)) {
        message +=
          " IPFS returned different bytes than the CID on-chain. Create a new vault and re-upload (VPS IPFS proxy fix), or use a file ≤1 KB for on-chain-only test unlock without IPFS.";
      }
      setError(message);

      if (err instanceof CDRError) {
        const code = (err as CDRError & { code?: string }).code;
        if (code === "EMPTY_VAULT" || code === "ACCESS_DENIED") {
          setView("unauthorized");
          return;
        }
      }

      setView("failed");
      await appendAuditAndNotify({
        actor: walletAddress ?? "unknown",
        action: "vault.access",
        target: vaultId,
        txHash: "—",
        status: "failed",
      });
    }
  }

  const explorerBase = config?.explorerBaseUrl ?? "https://aeneid.storyscan.io/tx/";

  return (
    <AppShell
      product="vaultline"
      title="Unlock a vault file"
      description="Runs a real CDR accessCDR read on Story Aeneid. IPFS uploads use each file's own CDR vault UUID — pick a file below or paste its file id."
    >
      <RegistrySyncBanner syncing={syncing} error={registryError} />

      {vaultRegistryFiles.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Files in vault {searchVaultId}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {vaultRegistryFiles.map((f) => (
                <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Decrypt with CDR {f.cdrUuid} · {f.storageKind}
                      {f.readCondition === "license" ? " · license required" : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFileId(f.id);
                      setVaultId(f.cdrUuid);
                      setView("idle");
                      setError(null);
                    }}
                  >
                    Use this file
                  </Button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              Registry vault id ({searchVaultId}) is not the same as the CDR UUID for IPFS file vaults. Always unlock via the file row or file id from Upload.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><UnlockIcon className="size-4" /> Unlock request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {fileMeta && needsLicense && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs space-y-1">
                <p className="font-medium text-foreground">PIL license required</p>
                <p className="text-muted-foreground">
                  IP <span className="font-mono">{fileMeta.ipId?.slice(0, 10)}…</span> · CDR file{" "}
                  {fileMeta.cdrUuid}
                </p>
                {buyerLicense ? (
                  <p className="text-foreground">
                    This wallet has license token{" "}
                    <span className="font-mono">{buyerLicense.licenseTokenId}</span>
                  </p>
                ) : (
                  <p className="text-chain-failed">
                    Connected wallet has no license in registry — switch to buyer or{" "}
                    {listingForFile ? (
                      <Link
                        to="/vaultline/listings/$id/buy"
                        params={{ id: listingForFile.id }}
                        className="underline"
                      >
                        buy license
                      </Link>
                    ) : (
                      <Link to="/vaultline/listings" className="underline">
                        browse listings
                      </Link>
                    )}
                    .
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>CDR vault UUID (numeric)</Label>
              <Input value={vaultId} onChange={(e) => setVaultId(e.target.value)} placeholder="e.g. 4945 — from file row above" />
              <p className="text-xs text-muted-foreground">
                On-chain secrets use the vault UUID from create-vault. IPFS/Storacha files use a separate CDR UUID per file (shown on Upload).
              </p>
            </div>
            <div className="space-y-2">
              <Label>File id (optional)</Label>
              <Input value={fileId} onChange={(e) => setFileId(e.target.value)} placeholder="From upload registry" />
              {fileMeta && (
                <p className="text-xs text-muted-foreground">
                  Registry: {fileMeta.name} ({fileMeta.size} bytes) · CDR {fileMeta.cdrUuid} · {fileMeta.storageKind}
                  {fileMeta.cid ? ` · CID ${fileMeta.cid.slice(0, 12)}…` : ""}
                </p>
              )}
              {searchFileId && registryReady && !fileMeta && (
                <p className="text-xs text-chain-failed">
                  File id not in registry — open Upload with your vault selected or pick a file from Vault detail.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" onClick={handleUnlock} disabled={view === "decrypting"}>
                Decrypt via CDR
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setView("idle");
                  setError(null);
                  setDecrypted(null);
                  setTxHash(null);
                }}
              >
                Reset
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              CDR verifies your wallet against the vault read condition, collects validator partials, and returns decrypted bytes.
            </p>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          {view === "idle" && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Result</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Submit an unlock request to run <code className="text-xs">accessCDR</code> on Story testnet.
              </CardContent>
            </Card>
          )}
          {view === "decrypting" && (
            <TxPendingState title="Requesting CDR decryption…" description="Submitting read tx and collecting validator partials from Story-API." />
          )}
          {view === "not-connected" && <NotConnectedState />}
          {view === "wrong-chain" && (
            <UnauthorizedState
              title="Wrong network"
              reason="Switch your wallet to Story Aeneid Testnet (chain ID 1315), then retry."
            />
          )}
          {view === "unauthorized" && (
            <UnauthorizedState
              reason={
                error ??
                "CDR rejected access — wrong CDR UUID (use the file's CDR id, not the registry vault label), empty vault, or missing license."
              }
              action={<Button asChild size="sm" variant="outline"><Link to="/vaultline/listings">Browse listings</Link></Button>}
            />
          )}
          {view === "failed" && (
            <TxFailedState error={error ?? "Decryption failed"} onRetry={() => setView("idle")} />
          )}
          {view === "success" && decrypted && txHash && (
            <SuccessState
              title="Decryption authorized"
              description={`Recovered ${decrypted.bytes.length} bytes from vault ${vaultId}.`}
              txHash={txHash}
              action={
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => downloadBytes(decrypted.bytes, decrypted.name, decrypted.mime)}
                  >
                    <Download className="size-4 mr-1.5" /> Download
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={explorerTxUrl(explorerBase, txHash)} target="_blank" rel="noreferrer">
                      View on Storyscan
                    </a>
                  </Button>
                </div>
              }
            />
          )}
        </aside>
      </div>
    </AppShell>
  );
}
