import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Database, Vault, ShieldCheck, Network, Cpu, Terminal } from "lucide-react";
import { ShaderHero } from "@/components/hero/ShaderHero";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cipherline — Sell private data and licensed answers on Story" },
      {
        name: "description",
        content:
          "Confidential data marketplace on Story Aeneid: Vaultline for licensed files, Queryline for answers without exposing raw datasets. Real CDR + PIL txs.",
      },
      { property: "og:title", content: "Cipherline" },
      {
        property: "og:description",
        content: "Monetize private files and dataset insights on Story — with on-chain licenses and audit proof.",
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
            Cipherline · Story Aeneid · Confidential data marketplace
          </p>
          <h1
            className="font-medium leading-[1.08] tracking-[-0.03em] text-zinc-900"
            style={{ fontSize: "clamp(1.75rem, 7vw, 4.2rem)" }}
          >
            Sell private data.<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            License files and answers<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            — not Drive links.
          </h1>
          <p className="text-zinc-600 max-w-2xl mt-6 text-[15px] sm:text-[16px] leading-relaxed">
            Creators and data owners monetize vaults on Story. Buyers pay for access or for a verified answer
            without receiving the raw dataset. Built on CDR + PIL with real txs, audit logs, and optional agent
            tooling for teams who want to integrate the same flows.
          </p>
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-5">
            <Link
              to="/vaultline"
              className="group bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[13px] sm:text-[14px] rounded-full pl-5 sm:pl-6 pr-2 py-2 inline-flex items-center gap-2 self-start"
            >
              <span className="overflow-hidden h-[20px] flex flex-col items-start">
                <span className="block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">Explore Vaultline</span>
                <span className="block">Explore Vaultline</span>
              </span>
              <span className="size-7 sm:size-8 rounded-full bg-white text-[#4f46e5] flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
                <ArrowRight className="size-4" />
              </span>
            </Link>
            <Link
              to="/queryline"
              className="group bg-white text-zinc-900 text-[13px] sm:text-[14px] rounded-full pl-5 sm:pl-6 pr-2 py-2 inline-flex items-center gap-2 self-start shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              <span className="overflow-hidden h-[20px] flex flex-col items-start">
                <span className="block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">Explore Queryline</span>
                <span className="block">Explore Queryline</span>
              </span>
              <span className="size-7 sm:size-8 rounded-full bg-zinc-900 text-white flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-white pt-16 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="size-6 sm:size-7 rounded-full bg-zinc-900 text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center">1</span>
            <span className="text-[12px] sm:text-[13px] font-medium border border-zinc-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              Two products · one Story stack
            </span>
          </div>
          <h2
            className="font-medium leading-[1.12] tracking-[-0.02em] text-zinc-900 mb-6 sm:mb-8"
            style={{ fontSize: "clamp(1.5rem, 4vw, 3.2rem)" }}
          >
            What people actually need<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>from private data.
          </h2>
          <p className="text-zinc-600 max-w-3xl text-[15px] leading-relaxed mb-12 sm:mb-16">
            High-value data is stuck in DMs and trust-based file shares. Cipherline turns it into programmable IP:
            pay-to-unlock files, or pay-for-answers without handing over the full dataset — with on-chain proof when
            access succeeds or fails.
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            <ProductCard
              icon={<Vault className="size-5" />}
              accent="bg-[#4f46e5]"
              eyebrow="Vaultline · sell files"
              title="License reports, datasets, and creator packs."
              copy="For creators, analysts, and teams selling CSVs, PDFs, or research. Encrypt → Story IP → buyer mints a license → CDR decrypts only for them. You earn; they get proof, not a leaky link."
              to="/vaultline"
              audience="Publishers & buyers"
            />
            <ProductCard
              icon={<Database className="size-5" />}
              accent="bg-[#3b6fa0]"
              eyebrow="Queryline · sell answers"
              title="Buyers pay for insights, not the raw file."
              copy="For benchmarks, due diligence, and analytics where the full dataset must stay private. Buyers request an allow-listed query; you fulfill into a result vault they can unlock — raw rows never leave your vault."
              to="/queryline"
              audience="Data owners & researchers"
            />
          </div>
        </div>
      </section>

      {/* WHO */}
      <section className="bg-[#F5F5F5] py-16 sm:py-20 lg:py-24 border-y border-zinc-200/80">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="size-6 sm:size-7 rounded-full bg-zinc-900 text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center">
              2
            </span>
            <span className="text-[12px] sm:text-[13px] font-medium border border-zinc-300 rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
              Who it&apos;s for
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            <AudienceCard
              title="Publishers"
              copy="Monetize analytics, datasets, and IP-backed files. Set price and license terms; every sale and unlock is auditable on Story."
            />
            <AudienceCard
              title="Buyers"
              copy="Pay for access or for a specific answer. No trust games — unauthorized wallets fail decrypt; licensed wallets get the file or result vault only."
            />
            <AudienceCard
              title="Builders on Story"
              copy="SDK, CLI, and MCP reuse the same vault and marketplace flows so new apps onboard users to the chain without rebuilding CDR plumbing."
            />
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="bg-[#F5F5F5] pt-16 sm:pt-20 lg:pt-28 pb-16 sm:pb-20 lg:pb-28">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="size-6 sm:size-7 rounded-full bg-zinc-900 text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center">3</span>
            <Link
              to="/architecture"
              className="text-[12px] sm:text-[13px] font-medium border border-zinc-300 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 hover:bg-white transition-colors"
            >
              CDR architecture map
            </Link>
          </div>
          <h2
            className="font-medium leading-[1.08] tracking-[-0.03em] mb-10 sm:mb-14 lg:mb-16"
            style={{ fontSize: "clamp(1.75rem, 7vw, 4.2rem)" }}
          >
            Live on Story Aeneid.<br />
            Real txs — built to grow with the chain.
          </h2>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            <Feature icon={<ShieldCheck className="size-5" />} title="Pay-to-unlock" copy="Buyers mint licenses; CDR only decrypts when on-chain access passes — failed attempts show up in audit." />
            <Feature icon={<Network className="size-5" />} title="On-chain proof" copy="Allocate, write, license, and unlock flows surface real tx hashes on Story testnet — not demo placeholders." />
            <Feature icon={<Vault className="size-5" />} title="Two-sided marketplace" copy="Listings and query requests connect publishers and buyers; shared registry so the network sees the same activity." />
            <Feature icon={<Database className="size-5" />} title="Answers without raw data" copy="Queryline keeps the dataset vault publisher-only; buyers unlock per-request result vaults." />
            <Feature icon={<Cpu className="size-5" />} title="Agents & integrations" copy="MCP tools and npm packages so AI workflows and new Story apps can onboard users through the same rails." />
            <Feature icon={<Terminal className="size-5" />} title="Attestation on fulfill" copy="Queryline fulfill binds EIP-712 payloads and Automata DCAP on-chain for stronger verifiability." />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function AudienceCard({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h3 className="text-[17px] font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-[14px] text-zinc-600 leading-relaxed">{copy}</p>
    </div>
  );
}

function ProductCard({
  icon, accent, eyebrow, title, copy, to, audience,
}: {
  icon: React.ReactNode;
  accent: string;
  eyebrow: string;
  title: string;
  copy: string;
  to: string;
  audience?: string;
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
      {audience ? (
        <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-wide mb-3">{audience}</p>
      ) : null}
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
