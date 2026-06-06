import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MCP_TOOLS } from "@/components/mcp/toolRegistry";
import { CodeBlock } from "@/components/snippets/CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/mcp")({
  head: () => ({
    meta: [
      { title: "Clearance402 · MCP tools" },
      { name: "description", content: "MCP tool reference for @line-stack/mcp-server — Vaultline & Queryline on Story Aeneid." },
    ],
  }),
  component: Page,
});

const MCP_CONFIG_PUBLISHED = `{
  "mcpServers": {
    "linestack": {
      "command": "npx",
      "args": ["-y", "@line-stack/mcp-server"],
      "env": {
        "LINESTACK_ENV_FILE": "~/.linestack/.env"
      }
    }
  }
}`;

function ToolGrid({ list }: { list: typeof MCP_TOOLS }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {list.map((t) => (
        <div key={t.name} className="rounded-2xl border bg-white p-5">
          <div className="font-mono text-sm font-semibold">{t.name}</div>
          <p className="text-sm text-zinc-600 mt-1.5">{t.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">Input</div>
              <ul className="text-xs font-mono space-y-0.5">
                {Object.keys(t.input).length === 0 ? (
                  <li className="text-zinc-500">—</li>
                ) : (
                  Object.entries(t.input).map(([k, v]) => (
                    <li key={k}>
                      <span className="text-zinc-900">{k}</span>: <span className="text-zinc-500">{v}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">Output</div>
              <ul className="text-xs font-mono space-y-0.5">
                {Object.entries(t.output).map(([k, v]) => (
                  <li key={k}>
                    <span className="text-zinc-900">{k}</span>: <span className="text-zinc-500">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Page() {
  const platform = MCP_TOOLS.filter((t) => t.product === "platform");
  const vault = MCP_TOOLS.filter((t) => t.product === "vaultline");
  const query = MCP_TOOLS.filter((t) => t.product === "queryline");

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1280px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">MCP tool explorer</h1>
        <p className="text-zinc-600 mt-2 max-w-2xl">
          Tools from <code className="text-sm">@line-stack/mcp-server</code> (stdio). Same flows as the CLI and web app on
          Story Aeneid — real CDR txs, shared VPS registry. Setup:{" "}
          <Link to="/agent-runbook" className="underline">
            Agent runbook
          </Link>{" "}
          ·{" "}
          <a href="https://github.com/henrysammarfo/linestack/blob/main/docs/AGENT-INTEGRATIONS.md" className="underline">
            full integration guide
          </a>
          .
        </p>

        <Tabs defaultValue="vaultline" className="mt-8">
          <TabsList>
            <TabsTrigger value="platform">Platform ({platform.length})</TabsTrigger>
            <TabsTrigger value="vaultline">Vaultline ({vault.length})</TabsTrigger>
            <TabsTrigger value="queryline">Queryline ({query.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="platform">
            <ToolGrid list={platform} />
          </TabsContent>
          <TabsContent value="vaultline">
            <ToolGrid list={vault} />
          </TabsContent>
          <TabsContent value="queryline">
            <ToolGrid list={query} />
          </TabsContent>
        </Tabs>

        <div className="mt-12 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">MCP server config (published)</h2>
            <p className="text-sm text-zinc-600 mb-3">
              Copy <code className="text-xs">docs/config/cursor-mcp.json</code> or use this block. Prefer{" "}
              <code className="text-xs">LINESTACK_ENV_FILE</code> — never commit wallet keys.
            </p>
            <CodeBlock lang="json" code={MCP_CONFIG_PUBLISHED} />
          </div>
          <p className="text-sm text-zinc-600">
            <strong>Queryline:</strong> <code className="text-xs">queryline_execute_query</code> = publisher fulfill
            (decrypt → template → result vault + EIP-712 + Automata). Not a CDR enclave job API.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
