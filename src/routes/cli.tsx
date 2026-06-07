import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CodeBlock } from "@/components/snippets/CodeBlock";

export const Route = createFileRoute("/cli")({
  head: () => ({
    meta: [
      { title: "Clearance402 · CLI" },
      { name: "description", content: "Verify tools and clear agent payments from the terminal with the Clearance402 CLI." },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1100px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl font-medium tracking-tight">CLI</h1>
        <p className="text-zinc-600 mt-2 max-w-2xl">
          Drive the Clearance402 trust layer from the terminal — onboard tools, run clearance probes, and check agent payments.
        </p>
        <div className="mt-8 space-y-6">
          <CodeBlock lang="bash" code={`npm install -g @clearance402/cli\n# export CLEARANCE402_API_KEY=sk_...\nclearance402 status`} />

          <div>
            <h2 className="text-xl font-semibold mb-2">Onboard &amp; verify a tool</h2>
            <CodeBlock
              lang="bash"
              code={`clearance402 tools onboard \\
  --name "Venice Vision API" \\
  --endpoint https://api.venice.ai/x402/vision \\
  --protocol x402 --price "0.010 USDC"

clearance402 tools probe venice-vision      # run a live clearance probe
clearance402 tools show venice-vision        # trust card: score + status checks`}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Agents &amp; clearance</h2>
            <CodeBlock
              lang="bash"
              code={`clearance402 agents register --id buyer-agent --mandate 5.00
clearance402 clear --agent buyer-agent --tool venice-vision --amount "0.010 USDC"
# → ALLOW | WARN | BLOCK | RETEST | HUMAN_APPROVAL_REQUIRED

clearance402 audit --kind PAYMENT --export audit.csv`}
            />
          </div>
        </div>

        <p className="text-sm text-zinc-600 mt-8">
          Prefer code? See the <Link to="/sdk" className="underline">SDK</Link>. Using an agent host? Wire up{" "}
          <Link to="/mcp" className="underline">MCP tools</Link>.
        </p>
      </section>
      <SiteFooter />
    </div>
  ),
});
