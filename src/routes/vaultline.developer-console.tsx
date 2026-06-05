import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ToolSnippets } from "@/components/snippets/ToolSnippets";

export const Route = createFileRoute("/vaultline/developer-console")({
  head: () => ({ meta: [{ title: "Vaultline · Developer console" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell product="vaultline" title="Developer console" description="SDK, CLI, and MCP snippets scoped to Vaultline. Copy-pasteable shape for real integration.">
      <ToolSnippets filter="vaultline" />
    </AppShell>
  );
}
