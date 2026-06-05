import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AuditLogTable } from "@/components/tables/AuditLogTable";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useQuerylineRegistry } from "@/lib/queryline/use-queryline-registry";

export const Route = createFileRoute("/queryline/audit")({
  head: () => ({ meta: [{ title: "Queryline · Audit log" }] }),
  component: Page,
});

function Page() {
  const { audit, syncing, error } = useQuerylineRegistry();

  return (
    <AppShell
      product="queryline"
      title="Queryline audit log"
      description="On-chain actions from the shared registry. Status filters apply to tx outcomes, not query request state."
    >
      <RegistrySyncBanner syncing={syncing} error={error} />
      <AuditLogTable
        scope="Queryline"
        product="queryline"
        entries={audit}
        storageKey="linestack.audit.queryline.page.v1"
      />
    </AppShell>
  );
}
