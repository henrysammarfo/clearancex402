import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CodeBlock } from "@/components/snippets/CodeBlock";

export const Route = createFileRoute("/mcp")({
  head: () => ({
    meta: [
      { title: "Clearance402 · MCP tools" },
      { name: "description", content: "MCP tool reference for @clearance402/mcp-server — verify tools and clear agent payments from any MCP host." },
    ],
  }),
  component: Page,
});

type McpTool = {
  name: string;
  description: string;
  input: Record<string, string>;
  output: Record<string, string>;
};

const MCP_TOOLS: McpTool[] = [
  {
    name: "clearance402_status",
    description: "Health and configuration of the trust layer and registry.",
    input: {},
    output: { ok: "boolean", registry: "string", version: "string" },
  },
  {
    name: "clearance402_tool_onboard",
    description: "Register an x402/MCP endpoint with price and expected output schema.",
    input: { name: "string", endpoint: "string", protocol: "x402|MCP", price: "string" },
    output: { toolId: "string", state: "ClearanceState" },
  },
  {
    name: "clearance402_tool_probe",
    description: "Run a live clearance probe: 402 challenge, payment, output check.",
    input: { toolId: "string" },
    output: { trust: "number", state: "ClearanceState", latencyMs: "number" },
  },
  {
    name: "clearance402_tool_card",
    description: "Fetch the trust card: score dimensions and live status checks.",
    input: { toolId: "string" },
    output: { trust: "number", scores: "object", checks: "object[]" },
  },
  {
    name: "clearance402_agent_register",
    description: "Create an agent identity with a spend mandate.",
    input: { id: "string", mandateUsd: "number" },
    output: { agentId: "string", mandateUsd: "number" },
  },
  {
    name: "clearance402_check_payment",
    description: "Decide if a tool is safe to pay for, given an agent and amount.",
    input: { agentId: "string", toolId: "string", amount: "string" },
    output: { state: "ClearanceState", reasons: "string[]" },
  },
];

const MCP_CONFIG = `{
  "mcpServers": {
    "clearance402": {
      "command": "npx",
      "args": ["-y", "@clearance402/mcp-server"],
      "env": {
        "CLEARANCE402_API_KEY": "sk_..."
      }
    }
  }
}`;

function Page() {
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1280px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">MCP tool explorer</h1>
        <p className="text-zinc-600 mt-2 max-w-2xl">
          Tools from <code className="text-sm">@clearance402/mcp-server</code> (stdio). Give any MCP host — Cursor, Claude, ChatGPT —
          the ability to verify x402/MCP tools and clear payments before spending. Same surface as the{" "}
          <Link to="/sdk" className="underline">SDK</Link> and <Link to="/cli" className="underline">CLI</Link>.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mt-8">
          {MCP_TOOLS.map((t) => (
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

        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">MCP server config</h2>
          <p className="text-sm text-zinc-600">
            Add this to your MCP host config. Keep <code className="text-xs">CLEARANCE402_API_KEY</code> out of source control — set it
            from <Link to="/settings" className="underline">Settings → API key</Link>.
          </p>
          <CodeBlock lang="json" code={MCP_CONFIG} />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
