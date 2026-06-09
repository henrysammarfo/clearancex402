import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Rocket, Wrench, Sparkles, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CodeBlock } from "@/components/snippets/CodeBlock";
import { McpInstallPanel } from "@/components/docs/McpInstallPanel";
import { cn } from "@/lib/utils";

type SectionId =
  | "overview"
  | "tool-onboarding"
  | "trust-cards"
  | "agent-clearance"
  | "payment-checks"
  | "audit-export"
  | "permissions"
  | "agent-tools";

const NAV: { id: SectionId; label: string; icon: ReactNode; group: string }[] = [
  { id: "overview", label: "Overview", icon: <BookOpen className="size-4" />, group: "Clearance402" },
  { id: "tool-onboarding", label: "Tool onboarding", icon: <Rocket className="size-4" />, group: "Clearance402" },
  { id: "trust-cards", label: "Trust cards", icon: <Sparkles className="size-4" />, group: "Clearance402" },
  { id: "agent-clearance", label: "Agent clearance", icon: <BookOpen className="size-4" />, group: "Workflows" },
  { id: "payment-checks", label: "Payment checks", icon: <BookOpen className="size-4" />, group: "Workflows" },
  { id: "audit-export", label: "Audit export", icon: <BookOpen className="size-4" />, group: "Workflows" },
  { id: "permissions", label: "Permissions", icon: <Wrench className="size-4" />, group: "Controls" },
  { id: "agent-tools", label: "Agent tools", icon: <Wrench className="size-4" />, group: "Controls" },
];

function scrollToSection(id: SectionId) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function StepCard({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 flex gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <span className="text-[#4f46e5] font-mono text-sm font-semibold shrink-0">{n}</span>
      <div>
        <p className="font-medium text-sm text-zinc-900">{title}</p>
        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export function DocsPage() {
  const [active, setActive] = useState<SectionId>("install-mcp");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as SectionId;
    if (hash && NAV.some((n) => n.id === hash)) {
      setActive(hash);
      requestAnimationFrame(() => scrollToSection(hash));
    }
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id as SectionId);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
    );
    for (const { id } of NAV) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, []);

  const groups = [...new Set(NAV.map((n) => n.group))];

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1280px] px-5 sm:px-8 py-10 lg:py-14">
        <div className="grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-14">
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Docs</p>
            {groups.map((g) => (
              <div key={g}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">{g}</p>
                <nav className="space-y-1">
                  {NAV.filter((n) => n.group === g).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActive(item.id);
                        scrollToSection(item.id);
                        window.history.replaceState(null, "", `#${item.id}`);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors border",
                        active === item.id
                          ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-sm"
                          : "bg-white text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:border-zinc-300",
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            ))}
            <Link to="/mcp" className="block text-sm font-medium text-[#4f46e5] hover:underline pt-2">
              Open MCP tools page →
            </Link>
          </aside>

          <article className="min-w-0 space-y-14 scroll-mt-24">
            <header>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4f46e5] mb-2">Clearance402</p>
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-zinc-900">Documentation</h1>
              <p className="text-zinc-600 mt-3 max-w-2xl text-[15px] leading-relaxed">
                Clearance402 verifies paid x402/MCP tools before agents spend: onboard tools, probe trust dimensions,
                check agent mandates, and export audit evidence.
              </p>
            </header>

            <section id="install-mcp" className="scroll-mt-24 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4f46e5]">Getting started</p>
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Install Clearance402 MCP</h2>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Install the MCP server in Cursor, Claude, Gemini, or VS Code so agents can request clearance before payment.
              </p>
              <McpInstallPanel />
              <StepCard n="01" title="Install">
                Paste the config for your client, set <code>CLEARANCE402_ENV_FILE</code> to your real path, restart the IDE,
                then ask the agent to call <code>clearance402_status</code>.
              </StepCard>
            </section>

            <section id="configure" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Configuration</h2>
              <p className="text-zinc-600 text-sm">
                Set these in <code className="bg-zinc-100 px-1 rounded">~/.clearance402/.env</code> (chmod 600). Never commit.
              </p>
              <CodeBlock
                theme="light"
                lang=".env"
                code={`CLEARANCE402_API_KEY=sk_...
CLEARANCE402_REGISTRY_URL=https://api.clearance402.local
CLEARANCE402_AGENT_ID=buyer-agent
CLEARANCE402_DEFAULT_MANDATE_USD=5.00
CLEARANCE402_NETWORK=base-sepolia`}
              />
            </section>

            <section id="tool-catalog" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Tool catalog</h2>
              <p className="text-zinc-600 text-sm">
                Clearance402 tools cover registry lookup, tool onboarding, live probing, trust-card retrieval,
                agent registration, payment checks, audit export, and permission revocation.
              </p>
              <Link
                to="/mcp"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white px-5 py-2 text-sm font-medium hover:bg-zinc-800"
              >
                Browse 17 MCP tools →
              </Link>
            </section>

            <section id="clearance" className="scroll-mt-24 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Concepts</p>
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Clearance states</h2>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Every check returns <code>ALLOW</code>, <code>WARN</code>, <code>BLOCK</code>, <code>RETEST</code>, or <code>HUMAN_APPROVAL_REQUIRED</code>.
              </p>
            </section>

            <section id="trust-cards" className="scroll-mt-24 space-y-3">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Trust cards</h2>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Trust cards show protocol compliance, price integrity, output quality, reliability, permission safety,
                relayer readiness, drift, and developer readiness.
              </p>
              <Link to="/tools" className="text-[#4f46e5] text-sm font-medium underline">
                Open trust-card registry →
              </Link>
            </section>

            <section id="payments" className="scroll-mt-24 space-y-3">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">x402 payments</h2>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Clearance402 checks the advertised price against the payment requirement, verifies the challenge/receipt,
                and blocks payment when the tool or mandate is unsafe.
              </p>
            </section>

            <section id="audit" className="scroll-mt-24 space-y-3">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Audit log</h2>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Audit entries record probes, payments, blocks, approvals, Venice evaluations, relays, revokes, and exports.
              </p>
            </section>

            <section id="permissions" className="scroll-mt-24 space-y-3">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Permissions</h2>
              <p className="text-zinc-600 text-sm leading-relaxed">
                ERC-7715-style spend mandates and revocation checks are evaluated before delegated wallet spend. See{" "}
                <Link to="/agent-demo" className="text-[#4f46e5] font-medium underline">
                  agent demo
                </Link>
                .
              </p>
            </section>
          </article>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
