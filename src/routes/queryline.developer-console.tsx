import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ToolSnippets } from "@/components/snippets/ToolSnippets";

export const Route = createFileRoute("/queryline/developer-console")({
  head: () => ({ meta: [{ title: "Queryline · Developer console" }] }),
  component: () => (
    <AppShell product="queryline" title="Developer console" description="SDK, CLI, and MCP snippets scoped to Queryline.">
      <ToolSnippets filter="queryline" />
    </AppShell>
  ),
});
