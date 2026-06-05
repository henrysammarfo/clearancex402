import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StatusChip } from "@/components/states";

export const Route = createFileRoute("/agent-runbook")({
  head: () => ({
    meta: [
      { title: "Cipherline · Agent runbook" },
      { name: "description", content: "Agent workflows for Vaultline and Queryline via MCP / CLI on Story Aeneid." },
    ],
  }),
  component: Page,
});

type Step = { call: string; desc: string; expect: "success" | "unauthorized" | "failed" | "pending" };

const VAULT: Step[] = [
  { call: "vaultline_create_vault", desc: "Create CDR vault (owner read/write).", expect: "pending" },
  { call: "vaultline_upload_file", desc: "Encrypt and upload file (IPFS + CDR).", expect: "pending" },
  { call: "vaultline_register_ip", desc: "Story IP + listing in one step (STORACHA_PROOF required).", expect: "pending" },
  { call: "vaultline_unlock_file", desc: "Unlock without license — expect CDR unauthorized.", expect: "unauthorized" },
  { call: "vaultline_buy_license", desc: "Buyer mints license for listing.", expect: "pending" },
  { call: "vaultline_unlock_file", desc: "Retry unlock with license — decrypt to disk.", expect: "success" },
];

const QUERY: Step[] = [
  { call: "queryline_create_dataset", desc: "Publisher allocates dataset vault + registry.", expect: "pending" },
  { call: "queryline_seed_dataset", desc: "Publisher writes JSON rows into dataset vault.", expect: "pending" },
  { call: "queryline_add_template", desc: "Register allow-listed template (e.g. avg_value_by_region).", expect: "pending" },
  { call: "queryline_request_query", desc: "Buyer requests query; result vault allocated.", expect: "pending" },
  {
    call: "queryline_execute_query",
    desc: "Publisher fulfill: CDR decrypt → template → result vault + EIP-712 + Automata DCAP tx.",
    expect: "pending",
  },
  { call: "queryline_unlock_result", desc: "Buyer decrypts answer only — not raw dataset.", expect: "success" },
];

function Flow({ title, steps }: { title: string; steps: Step[] }) {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <h3 className="text-xl font-semibold tracking-tight mb-4">{title}</h3>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3 p-3 rounded-xl border bg-card">
            <span className="size-7 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-xs font-mono font-semibold">{s.call}</code>
                <StatusChip status={s.expect} />
              </div>
              <p className="text-sm text-zinc-600 mt-1">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Page() {
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1280px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">Agent runbook</h1>
        <p className="text-zinc-600 mt-2 max-w-2xl">
          Production workflows for MCP and CLI. Tool names match{" "}
          <code className="text-sm">@line-stack/mcp-server</code> exactly. Configure env in{" "}
          <code className="text-sm">~/.linestack/.env</code> — see{" "}
          <a
            href="https://github.com/henrysammarfo/linestack/blob/main/docs/AGENT-INTEGRATIONS.md"
            className="underline"
          >
            Agent integrations
          </a>
          . Explorer: <Link to="/mcp" className="underline">MCP tools</Link>.
        </p>
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <Flow title="Vaultline · vault, list, license, unlock" steps={VAULT} />
          <Flow title="Queryline · dataset, fulfill, result" steps={QUERY} />
        </div>
        <p className="text-sm text-zinc-600 mt-6 max-w-2xl">
          Platform tools: <code className="text-xs">linestack_status</code>,{" "}
          <code className="text-xs">registry_refresh</code>,{" "}
          <code className="text-xs">vaultline_list</code>, <code className="text-xs">queryline_list</code>. Two wallets
          recommended for buyer vs publisher steps.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
