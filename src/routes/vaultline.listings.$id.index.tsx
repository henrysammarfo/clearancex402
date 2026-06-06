import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatEther } from "viem";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, LockedState } from "@/components/states";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useVaultlineRegistry } from "@/lib/vault/use-vaultline-registry";
import { getVault } from "@/lib/vault/registry";
import { explorerIpUrl } from "@/lib/story/register-ip-asset";
import { resolveVaultCdrUuid } from "@/lib/vault/resolve-vault-cdr";

export const Route = createFileRoute("/vaultline/listings/$id/")({
  head: ({ params }) => ({ meta: [{ title: `Vaultline · Listing ${params.id}` }] }),
  component: Page,
});

function Row({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-border/60 last:border-0">
      <span className="text-muted-foreground text-xs shrink-0">{label}</span>
      <span className={mono ? "font-mono text-xs break-all text-right sm:max-w-[70%]" : "text-sm text-right"}>
        {value}
      </span>
    </div>
  );
}

function Page() {
  const { id } = Route.useParams();
  const { listings, files, ready, syncing, error } = useVaultlineRegistry();
  const listing = listings.find((l) => l.id === id);
  const vaultFiles = listing ? files.filter((f) => f.vaultUuid === listing.vaultUuid) : [];
  const cdr = listing ? resolveVaultCdrUuid(listing.vaultUuid) : null;
  const priceIp = listing ? formatEther(BigInt(listing.priceWei || "0")) : "0";
  const seller = listing
    ? listing.seller ?? getVault(listing.vaultUuid)?.owner ?? "—"
    : "—";

  if (!ready) {
    return (
      <AppShell product="vaultline" title="Listing" description="Loading shared registry…">
        <EmptyState title="Loading" description="Fetching listings from the Clearance402 registry." />
      </AppShell>
    );
  }

  if (!listing) {
    return (
      <AppShell product="vaultline" title="Listing not found">
        <EmptyState
          title="Listing not found"
          description={`No listing "${id}" in the shared registry.`}
          action={
            <Button asChild size="sm">
              <Link to="/vaultline/ip-register">Register IP</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      product="vaultline"
      title={listing.title}
      description={listing.description || "Story IP listing on the shared marketplace."}
      actions={
        <Link
          to="/vaultline/listings/$id/buy"
          params={{ id }}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Buy license
        </Link>
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Listing details</CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="Listing id" value={listing.id} mono />
              <Row label="Price" value={`${priceIp} ${listing.currencyLabel}`} />
              <Row label="Seller" value={seller} mono />
              <Row
                label="Sale"
                value={listing.allowedBuyer ? `Private → ${listing.allowedBuyer}` : "Open marketplace"}
                mono={Boolean(listing.allowedBuyer)}
              />
              <Row label="License template" value={listing.licenseTemplate.replace(/-/g, " ")} />
              <Row label="License terms id" value={listing.licenseTermsId ?? "— (re-register IP)"} mono />
              <Row label="Vault (registry)" value={listing.vaultUuid} mono />
              <Row
                label="CDR vault UUID"
                value={cdr?.cdrUuid != null ? String(cdr.cdrUuid) : "— resolve via uploaded file"}
                mono
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Files in vault ({vaultFiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {vaultFiles.length === 0 ? (
                <LockedState title="No files indexed" description="Publisher must upload before buyers can unlock." />
              ) : (
                <ul className="space-y-3 text-sm">
                  {vaultFiles.map((f) => (
                    <li key={f.id} className="rounded-lg border p-3">
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {f.mime} · CDR {f.cdrUuid} · {f.readCondition ?? "owner"} read
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Story IP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-[11px] break-all leading-relaxed bg-muted/50 p-3 rounded-lg">
              {listing.ipId}
            </p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <a href={explorerIpUrl(listing.ipId)} target="_blank" rel="noreferrer">
                View IP on explorer
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
