import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import { AuditLogTable } from "@/components/tables/AuditLogTable";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useVaultlineRegistry } from "@/lib/vault/use-vaultline-registry";
import { useConnection } from "@/lib/connection";
import { readLastVaultId } from "@/lib/vault/last-vault";
import { useMemo } from "react";
import { DashboardWalletActions } from "@/components/wallet/DashboardWalletActions";

export const Route = createFileRoute("/vaultline/dashboard")({
  head: () => ({ meta: [{ title: "Vaultline · Dashboard" }, { name: "description", content: "Vaultline overview." }] }),
  component: Page,
});

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function Page() {
  const { vaults, files, unlocks, audit, listings, syncing, error } = useVaultlineRegistry();
  const { walletAddress } = useConnection();

  const myVaults = useMemo(() => {
    if (!walletAddress) return vaults;
    const w = walletAddress.toLowerCase();
    return vaults.filter((v) => v.owner.toLowerCase() === w);
  }, [vaults, walletAddress]);

  const myFiles = useMemo(() => {
    const ids = new Set(myVaults.map((v) => v.uuid));
    return files.filter((f) => ids.has(f.vaultUuid));
  }, [files, myVaults]);

  const myUnlocks = useMemo(() => {
    const ids = new Set(myVaults.map((v) => v.uuid));
    return unlocks.filter((u) => ids.has(u.vaultUuid));
  }, [unlocks, myVaults]);

  const defaultUploadVaultId = useMemo(() => {
    const last = readLastVaultId();
    if (last && myVaults.some((v) => v.uuid === last)) return last;
    const sorted = [...myVaults].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted[0]?.uuid;
  }, [myVaults]);

  return (
    <AppShell
      product="vaultline"
      title="Vaultline dashboard"
      description="Your vaults and files on the shared Cipherline registry — connect the same wallet on any device to see your data. Buyers browse all listings."
      actions={
        <>
          <DashboardWalletActions />
          <Button asChild variant="outline"><Link to="/vaultline/create-vault">New vault</Link></Button>
          <Button asChild>
            <Link
              to="/vaultline/upload"
              search={defaultUploadVaultId ? { vaultId: defaultUploadVaultId } : undefined}
            >
              Upload file
            </Link>
          </Button>
        </>
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />

      <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground mb-6 max-w-3xl">
        <strong className="text-foreground">Who we serve:</strong> creators and publishers license confidential files;
        buyers mint Story licenses to decrypt. Built on Story Aeneid + CDR — not a browser-only cache.
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Your vaults" value={String(myVaults.length)} hint={walletAddress ? "Filtered by connected wallet" : "Connect wallet to filter"} />
        <Stat label="Your uploads" value={String(myFiles.length)} hint="Files in your vaults" />
        <Stat label="Marketplace listings" value={String(listings.length)} hint="All publishers (shared registry)" />
        <Stat label="Your unlocks" value={String(myUnlocks.length)} hint="Decrypt events you ran" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent vaults</CardTitle></CardHeader>
          <CardContent>
            {myVaults.length === 0 ? (
              <EmptyState title="No vaults" description="Create a vault to encrypt and license a private file on Story." action={<Button asChild size="sm"><Link to="/vaultline/create-vault">Create vault</Link></Button>} />
            ) : (
              <ul className="space-y-3">
                {myVaults.slice(0, 5).map((v) => (
                  <li key={v.uuid} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{v.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">UUID {v.uuid}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        to="/vaultline/vaults/$uuid"
                        params={{ uuid: v.uuid }}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent"
                      >
                        View
                      </Link>
                      <Link
                        to="/vaultline/upload"
                        search={{ vaultId: v.uuid }}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent"
                      >
                        Upload
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent unlocks</CardTitle></CardHeader>
          <CardContent>
            {myUnlocks.length === 0 ? (
              <EmptyState title="No unlocks" description="Successful CDR decrypts from your wallet appear here." />
            ) : (
              <ul className="space-y-3">
                {myUnlocks.slice(0, 5).map((u) => (
                  <li key={u.id} className="text-sm">
                    <p className="font-medium truncate">{u.fileName}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      vault {u.vaultUuid} · {new Date(u.unlockedAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-3">Audit log</h2>
      <AuditLogTable scope="Vaultline" entries={audit} product="vaultline" storageKey="linestack.audit.vaultline.dashboard.v1" />
    </AppShell>
  );
}
