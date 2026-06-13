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
        <GetStarted intro="Pick your path, then run the trust layer from your terminal." />

        <DevSection step="01" title="Install &amp; configure" description="Build from monorepo, set API URL.">
          <CodeBlock lang="bash" code={`npm run build:cli
export CLEARANCE402_API_URL=http://localhost:8080
npm run cli -- status`} />
        </DevSection>

        <DevSection
          step="02"
          title="Onboard &amp; verify a tool"
          description="Register an endpoint, run a live probe, and read its Trust Card."
        >
          <CodeBlock
            lang="bash"
            code={`npm run cli -- tools onboard \\
  --name "Venice Vision API" \\
  --endpoint https://api.venice.ai/x402/vision \\
  --price "$0.010 USDC / call"

npm run cli -- tools probe venice-vision
npm run cli -- tools show venice-vision`}
          />
        </DevSection>

        <DevSection
          step="03"
          title="Agents &amp; clearance"
          description="Check clearance before payment; export audit trail."
        >
          <CodeBlock
            lang="bash"
            code={`npm run cli -- clear --agent buyer-agent --tool venice-vision --amount 0.01
# → ALLOW | WARN | BLOCK | RETEST | HUMAN_APPROVAL_REQUIRED

npm run cli -- audit --export audit.csv`}
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
