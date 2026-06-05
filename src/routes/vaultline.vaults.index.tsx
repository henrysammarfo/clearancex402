import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useVaultlineRegistry } from "@/lib/vault/use-vaultline-registry";
import { useConnection } from "@/lib/connection";
import { useMemo } from "react";

export const Route = createFileRoute("/vaultline/vaults/")({
  head: () => ({ meta: [{ title: "Vaultline · Vaults" }] }),
  component: Page,
});

function Page() {
  const { vaults, files, syncing, error } = useVaultlineRegistry();
  const { walletAddress } = useConnection();

  const myVaults = useMemo(() => {
    if (!walletAddress) return vaults;
    const w = walletAddress.toLowerCase();
    return vaults.filter((v) => v.owner.toLowerCase() === w);
  }, [vaults, walletAddress]);

  return (
    <AppShell
      product="vaultline"
      title="Your vaults"
      description="All CDR vaults you created on Story Aeneid — open, upload, register IP, or manage files."
      actions={
        <Button asChild>
          <Link to="/vaultline/create-vault">New vault</Link>
        </Button>
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />

      {myVaults.length === 0 ? (
        <EmptyState
          title="No vaults yet"
          description="Create a vault to start uploading licensed files."
          action={
            <Button asChild size="sm">
              <Link to="/vaultline/create-vault">Create vault</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {myVaults.map((v) => {
            const count = files.filter((f) => f.vaultUuid === v.uuid).length;
            return (
              <li key={v.uuid}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{v.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">CDR UUID {v.uuid}</p>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/vaultline/vaults/$uuid" params={{ uuid: v.uuid }}>
                        View
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/vaultline/upload" search={{ vaultId: v.uuid }}>
                        Upload ({count} file{count === 1 ? "" : "s"})
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to="/vaultline/ip-register" search={{ vaultId: v.uuid }}>
                        Register IP
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
