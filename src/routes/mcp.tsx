import { createFileRoute, Link } from "@tanstack/react-router";
import { DevPageShell, DevSection, DevCard } from "@/components/layout/DevPageShell";
import { CodeBlock } from "@/components/snippets/CodeBlock";

export const Route = createFileRoute("/mcp")({
  head: () => ({
    meta: [
      { title: "Clearance402 · Agent tools" },
      { name: "description", content: "Agent tool reference for Clearance402 — verify tools and clear payments from any compatible agent host." },
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
    <DevPageShell
      eyebrow="Developers"
      title="Agent tool connector"
      intro={
        <>
          Give Cursor, Claude, ChatGPT, and any compatible agent host the ability to verify paid tools and clear payments
          before spending — the same surface as the{" "}
          <Link to="/sdk" className="text-[#4f46e5] underline">SDK</Link> and{" "}
          <Link to="/cli" className="text-[#4f46e5] underline">CLI</Link>.
        </>
      }
    >
      <div className="space-y-10">
        <DevSection step="01" title="Connect your agent host" description="Add this to your agent host config, then restart it.">
          <CodeBlock lang="json" code={MCP_CONFIG} />
          <p className="text-[13px] text-zinc-500 mt-3">
            Keep <code className="text-[12px]">CLEARANCE402_API_KEY</code> out of source control — set it from{" "}
            <Link to="/settings" className="text-[#4f46e5] underline">Settings → API key</Link>.
          </p>
        </DevSection>

        <DevSection
          step="02"
          title="Available tools"
          description="Six focused tools cover onboarding, probing, trust cards, and payment clearance."
        >
          <div className="grid md:grid-cols-2 gap-4">
            {MCP_TOOLS.map((t) => (
              <DevCard key={t.name}>
                <div className="font-mono text-[13px] font-semibold text-zinc-900 break-all">{t.name}</div>
                <p className="text-[13px] text-zinc-600 mt-1.5 leading-relaxed">{t.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">Input</div>
                    <ul className="text-[11px] font-mono space-y-0.5">
                      {Object.keys(t.input).length === 0 ? (
                        <li className="text-zinc-400">—</li>
                      ) : (
                        Object.entries(t.input).map(([k, v]) => (
                          <li key={k} className="break-all">
                            <span className="text-zinc-900">{k}</span>: <span className="text-zinc-500">{v}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">Output</div>
                    <ul className="text-[11px] font-mono space-y-0.5">
                      {Object.entries(t.output).map(([k, v]) => (
                        <li key={k} className="break-all">
                          <span className="text-zinc-900">{k}</span>: <span className="text-zinc-500">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </DevCard>
            ))}
          </div>
        </DevSection>
      </div>
    </DevPageShell>
  );
}
