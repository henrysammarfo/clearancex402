import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Cpu, Network, Gauge, ScrollText, KeyRound } from "lucide-react";
import { ShaderHero } from "@/components/hero/ShaderHero";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clearance402 — Before your agent pays, it gets clearance" },
      {
        name: "description",
        content:
          "Clearance402 is the live trust, testing, onboarding, and safety layer for x402 / MCP agent services. Verify paid tools and let agents decide what is safe to pay for.",
      },
      { property: "og:title", content: "Clearance402" },
      {
        property: "og:description",
        content: "x402 lets agents pay. Clearance402 tells them what is safe to pay for.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col bg-[#EFEFEF]">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <ShaderHero />
        </div>
        <SiteHeader />
        <div className="flex-1" />
        <div className="relative z-20 mx-auto max-w-[1440px] w-full px-5 sm:px-8 lg:px-12 pb-14 sm:pb-16 lg:pb-20">
          <p className="text-[13px] sm:text-[14px] tracking-wide text-zinc-900 mb-5 sm:mb-8">
            Clearance402 · Trust layer for x402 &amp; MCP agent services
          </p>
          <h1
            className="font-medium leading-[1.08] tracking-[-0.03em] text-zinc-900"
            style={{ fontSize: "clamp(1.75rem, 7vw, 4.2rem)" }}
          >
            Before your agent pays,<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            it gets clearance.
          </h1>
          <p className="text-zinc-600 max-w-2xl mt-6 text-[15px] sm:text-[16px] leading-relaxed">
            x402 lets agents pay. Clearance402 tells them what is safe to pay for. Verify paid x402/MCP tools in real time —
            live probes, price checks, output verification, and risk scoring — before delegated wallet permissions are spent.
          </p>
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-5">
            <Link
              to="/dashboard"
              className="group bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[13px] sm:text-[14px] rounded-full pl-5 sm:pl-6 pr-2 py-2 inline-flex items-center gap-2 self-start"
            >
              <span className="overflow-hidden h-[20px] flex flex-col items-start">
                <span className="block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">Open the console</span>
                <span className="block" aria-hidden="true">Open the console</span>
              </span>
              <span className="size-7 sm:size-8 rounded-full bg-white text-[#4f46e5] flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
                <ArrowRight className="size-4" />
              </span>
            </Link>
            <Link
              to="/tools"
              className="group bg-white text-zinc-900 text-[13px] sm:text-[14px] rounded-full pl-5 sm:pl-6 pr-2 py-2 inline-flex items-center gap-2 self-start shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              <span className="overflow-hidden h-[20px] flex flex-col items-start">
                <span className="block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">Browse verified tools</span>
                <span className="block" aria-hidden="true">Browse verified tools</span>
              </span>
              <span className="size-7 sm:size-8 rounded-full bg-zinc-900 text-white flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* THREE-SIDED */}
      <section className="bg-white pt-16 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="size-6 sm:size-7 rounded-full bg-zinc-900 text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center">1</span>
            <span className="text-[12px] sm:text-[13px] font-medium border border-zinc-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              A pre-payment trust checkpoint
            </span>
          </div>
          <h2
            className="font-medium leading-[1.12] tracking-[-0.02em] text-zinc-900 mb-6 sm:mb-8"
            style={{ fontSize: "clamp(1.5rem, 4vw, 3.2rem)" }}
          >
            One layer that makes paid<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>agent tools safer to use.
          </h2>
          <p className="text-zinc-600 max-w-3xl text-[15px] leading-relaxed mb-12 sm:mb-16">
            Discovery and payments already exist. The missing wedge is trust: developers need to prove their tools are
            legit, agents need a machine-readable safe/unsafe decision, and users need a human-readable clearance card
            before approving spend.
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            <SideCard
              icon={<ShieldCheck className="size-5" />}
              accent="bg-[#4f46e5]"
              eyebrow="For developers"
              title="Onboard and prove your paid tool."
              copy="Run live probes, confirm a real 402 flow, evaluate output with Venice, and generate a Trust Card with proof and integration snippets."
              to="/tool-onboarding"
            />
            <SideCard
              icon={<Cpu className="size-5" />}
              accent="bg-[#3b6fa0]"
              eyebrow="For agents"
              title="Ask before you pay."
              copy="Call Clearance402 before paying a tool and receive ALLOW, WARN, BLOCK, RETEST, or HUMAN_APPROVAL_REQUIRED — with reasons."
              to="/agent-clearance"
            />
            <SideCard
              icon={<KeyRound className="size-5" />}
              accent="bg-[#4f46e5]"
              eyebrow="For users"
              title="See and control what agents buy."
              copy="Human-readable clearance cards, MetaMask Advanced Permission spend limits, and one-click revoke before delegated spending happens."
              to="/permissions"
            />
          </div>
        </div>
      </section>

      {/* DECISION STATES */}
      <section className="bg-[#F5F5F5] py-16 sm:py-20 lg:py-24 border-y border-zinc-200/80">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="size-6 sm:size-7 rounded-full bg-zinc-900 text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center">2</span>
            <span className="text-[12px] sm:text-[13px] font-medium border border-zinc-300 rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              Clearance decision states
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <StateCard title="ALLOW" copy="Passed live probe, price check, permission scope, output quality, and risk checks." />
            <StateCard title="WARN" copy="Works, but has latency, low confidence, new listing, price drift, or limited history." />
            <StateCard title="BLOCK" copy="Failed the x402 flow, returned mismatched output, exceeded scope, or looks risky." />
            <StateCard title="RETEST" copy="Status is stale or recent behavior changed — run another probe before payment." />
            <StateCard title="HUMAN APPROVAL" copy="Risk or spend is high enough that a person must approve manually." />
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="bg-[#F5F5F5] pt-16 sm:pt-20 lg:pt-28 pb-16 sm:pb-20 lg:pb-28">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="size-6 sm:size-7 rounded-full bg-zinc-900 text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center">3</span>
            <Link
              to="/docs"
              className="text-[12px] sm:text-[13px] font-medium border border-zinc-300 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 hover:bg-white transition-colors"
            >
              How clearance works
            </Link>
          </div>
          <h2
            className="font-medium leading-[1.08] tracking-[-0.03em] mb-10 sm:mb-14 lg:mb-16"
            style={{ fontSize: "clamp(1.75rem, 7vw, 4.2rem)" }}
          >
            Real integrations.<br />
            No mocks — proof on every decision.
          </h2>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            <Feature icon={<Gauge className="size-5" />} title="Live verification" copy="Probe endpoints, confirm a real 402 challenge, pay, retry, and verify the returned output against the declared schema." />
            <Feature icon={<ShieldCheck className="size-5" />} title="Trust scoring" copy="Eight dimensions: protocol, price, output, reliability, permission safety, relayer readiness, drift, and dev readiness." />
            <Feature icon={<Cpu className="size-5" />} title="Venice evaluation" copy="Venice scores output quality, behavior drift, and risk labels as part of the main clearance flow." />
            <Feature icon={<Network className="size-5" />} title="A2A coordination" copy="Scout discovers, Buyer pays, Verifier evaluates, Guardian blocks or allows — coordinated around each call." />
            <Feature icon={<KeyRound className="size-5" />} title="Permission safety" copy="MetaMask Advanced Permissions (ERC-7715) spend caps and revocation, checked before redemption." />
            <Feature icon={<ScrollText className="size-5" />} title="Auditable proof" copy="Every probe, payment, block, approval, relay, and evaluation is written to the audit log." />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function StateCard({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h3 className="text-[15px] font-semibold tracking-tight mb-2 font-mono">{title}</h3>
      <p className="text-[14px] text-zinc-600 leading-relaxed">{copy}</p>
    </div>
  );
}

function SideCard({
  icon, accent, eyebrow, title, copy, to,
}: {
  icon: React.ReactNode;
  accent: string;
  eyebrow: string;
  title: string;
  copy: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group block rounded-3xl border border-zinc-200 bg-white p-8 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-shadow"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className={`size-9 rounded-xl text-white flex items-center justify-center ${accent}`}>{icon}</span>
        <span className="text-[13px] font-medium text-zinc-500">{eyebrow}</span>
      </div>
      <h3 className="text-[22px] sm:text-[26px] font-medium tracking-tight leading-[1.2] text-zinc-900 mb-3">{title}</h3>
      <p className="text-[14px] sm:text-[15px] text-zinc-600 leading-relaxed mb-6">{copy}</p>
      <span className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-900">
        Explore
        <span className="size-7 rounded-full bg-zinc-900 text-white flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
          <ArrowRight className="size-3.5" />
        </span>
      </span>
    </Link>
  );
}

function Feature({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <span className="size-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-4">{icon}</span>
      <h3 className="text-[16px] font-semibold tracking-tight mb-1.5">{title}</h3>
      <p className="text-[14px] text-zinc-600 leading-relaxed">{copy}</p>
    </div>
  );
}
