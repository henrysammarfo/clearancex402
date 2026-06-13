import { createFileRoute, Link } from "@tanstack/react-router";
import { DevPageShell, DevSection, DevCard } from "@/components/layout/DevPageShell";
import { CodeBlock } from "@/components/snippets/CodeBlock";
import { GetStarted } from "@/components/onboarding/GetStarted";
import { MCP_TOOLS, MCP_CONFIG } from "@/lib/clearance/mcp-tools";

export const Route = createFileRoute("/mcp")({
  head: () => ({
    meta: [
      { title: "Clearance402 · Agent tools" },
      { name: "description", content: "Agent tool reference for Clearance402 — verify tools and clear payments from any compatible agent host." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DevPageShell
      eyebrow="Developers"
      title="Agent tool connector"
      intro={
        <>
          Give Cursor, Claude, and compatible agent hosts live clearance — probe, onboard, check, and audit via{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-[13px] border">@clearance402/mcp-server</code>.
        </>
      }
    >
      <div className="space-y-10">
        <GetStarted intro="Pick your path, then connect Clearance402 to your agent host." />

        <DevSection step="01" title="Connect your agent host" description="Add this to your MCP config, then restart.">
          <CodeBlock lang="json" code={MCP_CONFIG} />
          <p className="text-[13px] text-zinc-500 mt-3">
            Point <code className="text-[12px]">CLEARANCE402_API_URL</code> at your running app (default{" "}
            <code className="text-[12px]">http://localhost:8080</code>).
          </p>
        </DevSection>

        <DevSection
          step="02"
          title="Available tools"
          description="Eight MCP tools — matches the live server implementation."
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
