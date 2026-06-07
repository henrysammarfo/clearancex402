import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CodeBlock } from "@/components/snippets/CodeBlock";
import { StatusChip } from "@/components/states";

export const Route = createFileRoute("/agent-demo")({
  head: () => ({
    meta: [
      { title: "Clearance402 · Agent demo" },
      { name: "description", content: "End-to-end demo: onboard a tool, probe it, register an agent, and clear a payment before paying." },
    ],
  }),
  component: Page,
});

type Step = {
  call: string;
  desc: string;
  expect: "success" | "unauthorized" | "failed" | "pending";
};

const FLOW: Step[] = [
  { call: "tools onboard", desc: "Register an x402/MCP endpoint, price, and output schema.", expect: "pending" },
  { call: "tools probe", desc: "Send an unpaid request and confirm a real 402 challenge.", expect: "pending" },
  { call: "tools evaluate", desc: "Pay with a test wallet, retry, and check output matches the schema.", expect: "pending" },
  { call: "agents register", desc: "Create the buyer agent with a spend mandate.", expect: "pending" },
  { call: "clear (under mandate)", desc: "Ask Clearance402 — cleared tool returns ALLOW, agent pays.", expect: "success" },
  { call: "clear (over mandate)", desc: "Spend exceeds mandate → HUMAN_APPROVAL_REQUIRED.", expect: "unauthorized" },
  { call: "clear (bad tool)", desc: "Price/output mismatch → BLOCK, payment refused.", expect: "failed" },
];

function Page() {
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1100px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">Agent demo</h1>
        <p className="text-zinc-600 mt-2 max-w-2xl">
          A full run: onboard a paid tool, verify it, register an agent, and clear payments. Try the interactive version on the{" "}
          <Link to="/agent-clearance" className="underline">Agent clearance</Link> page.
        </p>

        <div className="rounded-2xl border bg-white p-6 mt-8">
          <h3 className="text-xl font-semibold tracking-tight mb-4">Clearance402 flow</h3>
          <ol className="space-y-3">
            {FLOW.map((s, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-xl border bg-card">
                <span className="size-7 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono font-semibold">clearance402 {s.call}</code>
                    <StatusChip status={s.expect} />
                  </div>
                  <p className="text-sm text-zinc-600 mt-1">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Same flow in code</h2>
          <CodeBlock
            lang="ts"
            code={`import { Clearance402 } from "@clearance402/sdk";

const c402 = new Clearance402({ apiKey: process.env.CLEARANCE402_API_KEY });

await c402.onboardTool({ name: "Venice Vision API", endpoint: "https://api.venice.ai/x402/vision", protocol: "x402", price: "0.010 USDC" });
await c402.probe("venice-vision");

const agent = await c402.registerAgent({ id: "buyer-agent", mandateUsd: 5 });
const decision = await c402.checkBeforePayment({ agentId: agent.id, toolId: "venice-vision", amount: "0.010 USDC" });

if (decision.state === "ALLOW") await c402.payIfCleared("venice-vision", ctx);`}
          />
        </div>

        <p className="text-sm text-zinc-600 mt-8">
          Build it with the <Link to="/sdk" className="underline">SDK</Link>,{" "}
          <Link to="/cli" className="underline">CLI</Link>, or{" "}
          <Link to="/mcp" className="underline">MCP tools</Link>.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
