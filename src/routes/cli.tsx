import { createFileRoute, Link } from "@tanstack/react-router";
import { Code2, Boxes, Package, ArrowRight } from "lucide-react";
import { DevPageShell, DevSection, DevCard } from "@/components/layout/DevPageShell";
import { CodeBlock } from "@/components/snippets/CodeBlock";
import { GetStarted } from "@/components/onboarding/GetStarted";

export const Route = createFileRoute("/cli")({
  head: () => ({
    meta: [
      { title: "Clearance402 · CLI" },
      { name: "description", content: "Verify tools and clear agent payments from the terminal with the Clearance402 CLI." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <DevPageShell
      eyebrow="Developers"
      title="Command line"
      intro="Run the whole trust layer from your terminal — onboard tools, run live clearance probes, check agent payments, and export an audit trail."
    >
      <div className="space-y-10">
        <DevSection step="01" title="Install &amp; sign in" description="Install globally, then set your API key.">
          <CodeBlock lang="bash" code={`npm install -g @clearance402/cli\nexport CLEARANCE402_API_KEY=sk_...\nclearance402 status`} />
        </DevSection>

        <DevSection
          step="02"
          title="Onboard &amp; verify a tool"
          description="Register an endpoint, run a live probe, and read its Trust Card."
        >
          <CodeBlock
            lang="bash"
            code={`clearance402 tools onboard \\
  --name "Venice Vision API" \\
  --endpoint https://api.venice.ai/x402/vision \\
  --protocol x402 --price "0.010 USDC"

clearance402 tools probe venice-vision      # run a live clearance probe
clearance402 tools show venice-vision       # trust card: score + status checks`}
          />
        </DevSection>

        <DevSection
          step="03"
          title="Agents &amp; clearance"
          description="Register an agent mandate and clear payments before they happen."
        >
          <CodeBlock
            lang="bash"
            code={`clearance402 agents register --id buyer-agent --mandate 5.00
clearance402 clear --agent buyer-agent --tool venice-vision --amount "0.010 USDC"
# → ALLOW | WARN | BLOCK | RETEST | HUMAN_APPROVAL_REQUIRED

clearance402 audit --kind PAYMENT --export audit.csv`}
          />
        </DevSection>

        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <NextCard to="/sdk" icon={<Code2 className="size-4" />} title="SDK" copy="Prefer code? Use the SDK." />
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
