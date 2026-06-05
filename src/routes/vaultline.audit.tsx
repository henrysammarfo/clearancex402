import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AuditLogTable } from "@/components/tables/AuditLogTable";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useVaultlineRegistry } from "@/lib/vault/use-vaultline-registry";

export const Route = createFileRoute("/vaultline/audit")({
  head: () => ({ meta: [{ title: "Vaultline · Audit log" }] }),
  component: Page,
});

function Page() {
  const { audit, syncing, error } = useVaultlineRegistry();

  return (
    <AppShell
      product="vaultline"
      title="Vaultline audit log"
      description="Every CDR and Story action with explorer tx hashes (shared registry)."
    >
      <RegistrySyncBanner syncing={syncing} error={error} />
      <AuditLogTable
        scope="Vaultline"
        product="vaultline"
        entries={audit}
        storageKey="linestack.audit.vaultline.page.v1"
      />
    </AppShell>
  );
}
