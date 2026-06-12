import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Rocket, Wrench, Sparkles, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CodeBlock } from "@/components/snippets/CodeBlock";
import { McpInstallPanel } from "@/components/docs/McpInstallPanel";
import { GetStarted } from "@/components/onboarding/GetStarted";
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
  const [active, setActive] = useState<SectionId>("overview");

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
                      aria-current={active === item.id ? "true" : undefined}
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
              Open agent tools page →
            </Link>
          </aside>

          <article className="min-w-0 space-y-14 scroll-mt-24">
            <header>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4f46e5] mb-2">Clearance402</p>
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-zinc-900">Clearance402 docs</h1>
              <p className="text-zinc-600 mt-3 max-w-2xl text-[15px] leading-relaxed">
                Clearance402 verifies paid agent tools before spend: onboard tools, probe trust dimensions,
                check agent mandates, and export audit evidence.
              </p>
            </header>

            {/* Mobile section nav */}
            <nav className="lg:hidden -mx-5 px-5 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 w-max pb-1">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active === item.id ? "true" : undefined}
                    onClick={() => {
                      setActive(item.id);
                      scrollToSection(item.id);
                      window.history.replaceState(null, "", `#${item.id}`);
                    }}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium border transition-colors",
                      active === item.id
                        ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                        : "bg-white text-zinc-600 border-zinc-200",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>

            <GetStarted />



            <section id="overview" className="scroll-mt-24 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4f46e5]">Clearance402</p>
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">One quiet checkpoint before an agent pays</h2>
              <p className="text-zinc-600 text-[15px] leading-7">
                Clearance402 keeps the complex verification work behind the scenes. Agents send a tool, amount, and mandate;
                Clearance402 returns a clear decision with the evidence needed to trust or block the payment.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <StepCard n="01" title="Discover">Find a paid tool and read its Trust Card.</StepCard>
                <StepCard n="02" title="Check">Run live protocol, price, output, and permission checks.</StepCard>
                <StepCard n="03" title="Decide">Return ALLOW, WARN, BLOCK, RETEST, or HUMAN_APPROVAL_REQUIRED.</StepCard>
              </div>
            </section>

            <section id="tool-onboarding" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Tool onboarding</h2>
              <p className="text-zinc-600 text-[15px] leading-7">
                Developers register the endpoint, protocol, advertised price, output schema, and owner contact. Clearance402
                immediately runs a probe and shows pending, passed, blocked, or retest states.
              </p>
              <CodeBlock
                theme="light"
                lang="bash"
                code={`clearance402 tools onboard \
  --name "Weather API" \
  --endpoint https://api.example.com/x402 \
  --protocol x402 \
  --price "0.010 USDC"`}
              />
              <Link to="/tool-onboarding" className="text-[#4f46e5] text-sm font-medium underline">
                Open tool onboarding →
              </Link>
            </section>

            <section id="trust-cards" className="scroll-mt-24 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Clearance402</p>
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Trust cards</h2>
              <p className="text-zinc-600 text-[15px] leading-7">
                Trust cards show protocol compliance, price integrity, output quality, reliability, permission safety,
                relayer readiness, drift, and developer readiness.
              </p>
              <Link to="/tools" className="text-[#4f46e5] text-sm font-medium underline">
                Open trust-card registry →
              </Link>
            </section>

            <section id="agent-clearance" className="scroll-mt-24 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Workflows</p>
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Agent clearance</h2>
              <p className="text-zinc-600 text-[15px] leading-7">
                Agents register an identity and spend mandate, then ask Clearance402 before each payment. The response is short,
                machine-readable, and safe for automated routing.
              </p>
              <Link to="/agent-clearance" className="text-[#4f46e5] text-sm font-medium underline">
                Open agent clearance →
              </Link>
            </section>

            <section id="payment-checks" className="scroll-mt-24 space-y-3">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Payment checks</h2>
              <p className="text-zinc-600 text-[15px] leading-7">
                Clearance402 checks the advertised price against the payment requirement, verifies the challenge/receipt,
                and blocks payment when the tool or mandate is unsafe.
              </p>
            </section>

            <section id="audit-export" className="scroll-mt-24 space-y-3">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Audit export</h2>
              <p className="text-zinc-600 text-[15px] leading-7">
                Audit entries record probes, payments, blocks, approvals, evaluations, relays, revokes, and exports. Filter by
                event type, search by actor or tool, then download CSV evidence.
              </p>
              <Link to="/audit" className="text-[#4f46e5] text-sm font-medium underline">
                Open audit log →
              </Link>
            </section>

            <section id="permissions" className="scroll-mt-24 space-y-3">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Permissions</h2>
              <p className="text-zinc-600 text-[15px] leading-7">
                ERC-7715-style spend mandates and revocation checks are evaluated before delegated wallet spend. See{" "}
                <Link to="/agent-demo" className="text-[#4f46e5] font-medium underline">
                  agent demo
                </Link>
                .
              </p>
            </section>

            <section id="agent-tools" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-medium tracking-tight text-zinc-900">Agent tools</h2>
              <p className="text-zinc-600 text-[15px] leading-7">
                Install the agent connector in Cursor, Claude, Gemini, or VS Code so agents can request clearance before payment.
              </p>
              <McpInstallPanel />
              <Link to="/mcp" className="text-[#4f46e5] text-sm font-medium underline">
                Open agent tools →
              </Link>
            </section>
          </article>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
