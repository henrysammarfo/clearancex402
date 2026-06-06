import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CodeBlock } from "@/components/snippets/CodeBlock";

export const Route = createFileRoute("/sdk")({
  head: () => ({ meta: [{ title: "Clearance402 · SDK" }] }),
  component: () => (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1100px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl font-medium tracking-tight">SDK</h1>
        <p className="text-zinc-600 mt-2 max-w-2xl">
          Node SDK wrapping real CDR flows on Aeneid. See <code className="text-sm">docs/SDK-CLI-MCP.md</code> in the repo.
        </p>
        <div className="mt-8 space-y-6">
          <CodeBlock lang="bash" code={`npm install @line-stack/sdk\n# ~/.linestack/.env or LINESTACK_ENV_FILE`} />
          <CodeBlock lang="ts" code={`import { LineStack } from "@line-stack/sdk";\n\nconst ls = new LineStack();\nawait ls.connect();\n\nconst { cdrUuid } = await ls.vaultlineCreateVault("imaging");\nawait ls.vaultlineWriteSecret(cdrUuid, JSON.stringify({ meta: true }));\n\nconst { datasetId } = await ls.querylineCreateDataset("patients");\nawait ls.querylineSeedDataset(datasetId, { rows: [{ region: "EU", value: 10 }] });\nconst { templateId } = await ls.querylineAddTemplate(datasetId, "avg_value_by_region");\nconst { requestId } = await ls.querylineRequestQuery(datasetId, templateId, { region: "EU" });\nawait ls.querylineFulfillRequest(requestId);\nconst { data } = await ls.querylineUnlockResult(requestId);`} />
        </div>
      </section>
      <SiteFooter />
    </div>
  ),
});
