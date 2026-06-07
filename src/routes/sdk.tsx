import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CodeBlock } from "@/components/snippets/CodeBlock";

export const Route = createFileRoute("/sdk")({
  head: () => ({
    meta: [
      { title: "Clearance402 · SDK" },
      { name: "description", content: "Node/TS SDK to verify x402 and MCP tools and clear payments before your agent pays." },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1100px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl font-medium tracking-tight">SDK</h1>
        <p className="text-zinc-600 mt-2 max-w-2xl">
          The Clearance402 SDK wraps the trust layer: probe an endpoint, evaluate output, and get an{" "}
          <code className="text-sm">ALLOW / WARN / BLOCK / RETEST / HUMAN_APPROVAL_REQUIRED</code> decision before your agent spends.
        </p>
        <div className="mt-8 space-y-6">
          <CodeBlock lang="bash" code={`npm install @clearance402/sdk\n# CLEARANCE402_API_KEY from Settings → API key`} />

          <div>
            <h2 className="text-xl font-semibold mb-2">Clear a payment before paying</h2>
            <CodeBlock
              lang="ts"
              code={`import { Clearance402 } from "@clearance402/sdk";

const c402 = new Clearance402({ apiKey: process.env.CLEARANCE402_API_KEY });

// Register an agent identity + spend mandate
const agent = await c402.registerAgent({ id: "buyer-agent", mandateUsd: 5 });

// Ask before paying
const decision = await c402.checkBeforePayment({
  agentId: agent.id,
  toolId: "venice-vision",
  amount: "0.010 USDC",
});

if (decision.state === "ALLOW") {
  await c402.payIfCleared("venice-vision", ctx);
} else if (decision.state === "HUMAN_APPROVAL_REQUIRED") {
  await c402.requestApproval(decision);
} else {
  console.warn("Blocked:", decision.reasons);
}`}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Onboard your own tool</h2>
            <CodeBlock
              lang="ts"
              code={`const card = await c402.onboardTool({
  name: "Venice Vision API",
  endpoint: "https://api.venice.ai/x402/vision",
  protocol: "x402",
  price: "0.010 USDC",
  schema: { label: "string", confidence: "number" },
});

console.log(card.trust, card.state); // 96 "ALLOW"`}
            />
          </div>
        </div>

        <p className="text-sm text-zinc-600 mt-8">
          Next: try the <Link to="/cli" className="underline">CLI</Link>, wire up{" "}
          <Link to="/mcp" className="underline">MCP tools</Link>, or run the{" "}
          <Link to="/agent-demo" className="underline">agent demo</Link>.
        </p>
      </section>
      <SiteFooter />
    </div>
  ),
});
