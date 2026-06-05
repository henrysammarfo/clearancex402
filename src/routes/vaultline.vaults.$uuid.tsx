import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/states";
import { AuditLogTable } from "@/components/tables/AuditLogTable";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useVaultlineRegistry } from "@/lib/vault/use-vaultline-registry";
import { useConnection } from "@/lib/connection";
import { getClientEnv } from "@/lib/env/client";
import {
  deleteVaultFile,
  getIpAssetForVault,
  updateVault,
} from "@/lib/vault/registry";
import { explorerTxUrl } from "@line-stack/cdr-core";

export const Route = createFileRoute("/vaultline/vaults/$uuid")({
  head: ({ params }) => ({ meta: [{ title: `Vaultline · Vault ${params.uuid}` }] }),
  component: Page,
});

function Page() {
  const { uuid } = Route.useParams();
  const { vaults, files, listings, audit, syncing, error, refresh } = useVaultlineRegistry();
  const { walletAddress } = useConnection();
  const env = getClientEnv();
  const vault = vaults.find((v) => v.uuid === uuid);
  const vaultFiles = files.filter((f) => f.vaultUuid === uuid);
  const vaultListings = listings.filter((l) => l.vaultUuid === uuid);
  const vaultAudit = audit.filter(
    (e) => e.target.includes(uuid) || e.action.includes(uuid),
  );
  const ipAsset = getIpAssetForVault(uuid);
  const isOwner =
    vault && walletAddress && vault.owner.toLowerCase() === walletAddress.toLowerCase();

  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);

  if (!vault) {
    return (
      <AppShell product="vaultline" title={`Vault ${uuid}`} description="Vault detail.">
        <RegistrySyncBanner syncing={syncing} error={error} />
        <EmptyState
          title="Vault not found"
          description="This vault is not in the shared registry. Create one or check the UUID."
          action={
            <Button asChild size="sm">
              <Link to="/vaultline/create-vault">Create vault</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const allocateUrl = explorerTxUrl(env.explorerTxBaseUrl, vault.allocateTxHash);
  const displayName = editName || vault.name;

  async function saveName() {
    if (!isOwner || !editName.trim() || editName.trim() === vault!.name) return;
    setSaving(true);
    setManageError(null);
    try {
      await updateVault({ ...vault!, name: editName.trim() });
      setEditName("");
      await refresh();
    } catch (err) {
      setManageError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function removeFile(fileId: string) {
    if (!isOwner || !confirm("Remove this file from the shared registry? (On-chain CDR data remains.)")) {
      return;
    }
    setManageError(null);
    try {
      await deleteVaultFile(fileId);
      await refresh();
    } catch (err) {
      setManageError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <AppShell
      product="vaultline"
      title={vault.name}
      description={`CDR vault on Story Aeneid · UUID ${vault.uuid}`}
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/vaultline/vaults">All vaults</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/vaultline/upload" search={{ vaultId: vault.uuid }}>
              Upload file
            </Link>
          </Button>
          <Button asChild>
            <Link to="/vaultline/ip-register" search={{ vaultId: vault.uuid }}>
              {ipAsset && !ipAsset.licenseTermsId ? "Re-register IP" : "Register IP"}
            </Link>
          </Button>
        </>
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />
      {manageError && (
        <p className="text-sm text-chain-failed mb-4">{manageError}</p>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vault</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            {isOwner && (
              <div className="space-y-2 pb-3 border-b">
                <Label htmlFor="vault-name">Display name</Label>
                <div className="flex gap-2">
                  <Input
                    id="vault-name"
                    value={editName || vault.name}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={vault.name}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={saving || !editName.trim() || editName.trim() === vault.name}
                    onClick={() => void saveName()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
            <p>
              <span className="text-muted-foreground">Label </span>
              {displayName}
            </p>
            <p>
              <span className="text-muted-foreground">Owner </span>
              <span className="font-mono">{vault.owner}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Created </span>
              {new Date(vault.createdAt).toLocaleString()}
            </p>
            <p>
              <span className="text-muted-foreground">Allocate tx </span>
              <a
                href={allocateUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs underline"
              >
                {vault.allocateTxHash.slice(0, 14)}…
              </a>
            </p>
            {ipAsset && (
              <p>
                <span className="text-muted-foreground">Story IP </span>
                <span className="font-mono text-xs break-all">{ipAsset.ipId}</span>
                {!ipAsset.licenseTermsId && (
                  <span className="text-chain-pending text-xs ml-1">(missing terms — re-register)</span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Listings ({vaultListings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {vaultListings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No Story IP listing for this vault yet.</p>
            ) : (
              <ul className="space-y-2">
                {vaultListings.map((l) => (
                  <li key={l.id} className="text-sm">
                    <Link
                      to="/vaultline/listings/$id"
                      params={{ id: l.id }}
                      className="font-medium underline"
                    >
                      {l.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Seller {l.seller?.slice(0, 10) ?? vault.owner.slice(0, 10)}…
                      {l.allowedBuyer ? " · private sale" : " · public"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-sm">Files ({vaultFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {vaultFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files uploaded to this vault yet.</p>
          ) : (
            <ul className="space-y-3">
              {vaultFiles.map((f) => (
                <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 text-sm rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      CDR {f.cdrUuid} · {f.storageKind} · tx {f.writeTxHash.slice(0, 12)}…
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/vaultline/unlock" search={{ vaultId: vault.uuid, fileId: f.id }}>
                        Unlock
                      </Link>
                    </Button>
                    {isOwner && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-chain-failed"
                        onClick={() => void removeFile(f.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-3">Activity</h2>
      <AuditLogTable entries={vaultAudit} storageKey={`linestack.audit.vault.${uuid}`} />
    </AppShell>
  );
}
