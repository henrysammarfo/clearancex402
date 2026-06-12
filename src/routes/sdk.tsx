import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Terminal, Boxes, ArrowRight } from "lucide-react";
import { DevPageShell, DevSection, DevCard } from "@/components/layout/DevPageShell";
import { CodeBlock } from "@/components/snippets/CodeBlock";
import { GetStarted } from "@/components/onboarding/GetStarted";

export const Route = createFileRoute("/sdk")({
  head: () => ({
    meta: [
      { title: "Clearance402 · SDK" },
      { name: "description", content: "Node/TS SDK to verify x402 and MCP tools and clear payments before your agent pays." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DevPageShell
      eyebrow="Developers"
      title="TypeScript SDK"
      intro={
        <>
          Drop the trust layer into any Node or TypeScript agent. Probe a tool, evaluate its output, and get a clear{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-[13px] text-zinc-800 border border-zinc-200">
            ALLOW / WARN / BLOCK
          </code>{" "}
          decision before a single cent is spent.
        </>
      }
    >
      <div className="space-y-10">
        <GetStarted intro="Pick your path, then drop the SDK into your agent." />

        <DevSection step="01" title="Install" description="Add the package and set your API key from Settings.">
          <CodeBlock lang="bash" code={`npm install @clearance402/sdk\n# CLEARANCE402_API_KEY comes from Settings → API key`} />
        </DevSection>

        <DevSection
          step="02"
          title="Clear a payment before paying"
          description="Register an agent with a spend mandate, then ask Clearance402 before every payment."
        >
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
        </DevSection>

        <DevSection
          step="03"
          title="Onboard your own tool"
          description="Register an endpoint and get back a Trust Card with a score and live status."
        >
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
        </DevSection>

        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <NextCard to="/cli" icon={<Terminal className="size-4" />} title="CLI" copy="Same checks from your terminal." />
          <NextCard to="/mcp" icon={<Boxes className="size-4" />} title="Agent tools" copy="Wire it into Cursor or Claude." />
          <NextCard to="/agent-demo" icon={<Package className="size-4" />} title="Agent demo" copy="See an end-to-end run." />
        </div>
      </div>
    </DevPageShell>
  );
}

function NextCard({ to, icon, title, copy }: { to: string; icon: React.ReactNode; title: string; copy: string }) {
  return (
    <Link to={to}>
      <DevCard className="group h-full transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
        <span className="size-8 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center mb-3">{icon}</span>
        <div className="flex items-center gap-1.5 font-medium text-zinc-900">
          {title}
          <ArrowRight className="size-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
        </div>
        <p className="text-[13px] text-zinc-500 mt-1">{copy}</p>
      </DevCard>
    </Link>
  );
}
