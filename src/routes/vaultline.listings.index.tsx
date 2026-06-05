import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useVaultlineRegistry } from "@/lib/vault/use-vaultline-registry";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/vaultline/listings/")({
  head: () => ({ meta: [{ title: "Vaultline · Listings" }] }),
  component: Page,
});

function Page() {
  const { listings, syncing, error } = useVaultlineRegistry();

  return (
    <AppShell
      product="vaultline"
      title="Listings"
      description="Story IP listings on the shared registry — visible to all buyers; create with the publisher wallet."
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/vaultline/ip-register">Register IP</Link>
          </Button>
          <Button asChild>
            <Link to="/vaultline/create-vault">New vault</Link>
          </Button>
        </>
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />

      {listings.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Create a vault, upload a file, register IP on Story, then your listing appears here."
          action={
            <Button asChild variant="outline">
              <Link to="/vaultline/ip-register">Register IP</Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Vault</TableHead>
                <TableHead>IP id</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>License</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.title}</TableCell>
                  <TableCell className="font-mono text-xs">{l.vaultUuid}</TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[140px]" title={l.ipId}>
                    {l.ipId.slice(0, 10)}…
                  </TableCell>
                  <TableCell className="text-xs">
                    {(Number(l.priceWei) / 1e18).toFixed(4)} {l.currencyLabel}
                  </TableCell>
                  <TableCell className="text-xs capitalize">{l.licenseTemplate.replace("-", " ")}</TableCell>
                  <TableCell>
                    <Link
                      to="/vaultline/listings/$id"
                      params={{ id: l.id }}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
