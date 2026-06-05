import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ArrowRight } from "lucide-react";
import {
  AccessFlowDiagram,
  FullStackDiagram,
  MarketplaceLifecycleDiagram,
  ProductSplitDiagram,
} from "@/components/architecture/ArchitectureDiagrams";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Cipherline · Architecture — Programmable IP on CDR" },
      {
        name: "description",
        content:
          "Status Quo vs CDR + Story marketplace architecture. Eight-step mapping to Vaultline and Queryline on Cipherline.",
      },
    ],
  }),
  component: ArchitecturePage,
});

const STATUS_QUO = [
  { label: "Contributor", sub: "voice, video, expertise" },
  { label: "One-Time Payment", sub: "single coin" },
  { label: "Loss of Control", sub: "data leaves forever" },
  { label: "Platforms profit indefinitely", sub: "black box reuse" },
];

const STEPS_CREATE = [
  {
    n: 1,
    title: "Upload",
    body: "Contributor adds files or structured rows to the marketplace.",
    linestack: "Vaultline: upload file · Queryline: seed dataset",
    routes: ["/vaultline/upload", "/queryline/create-dataset"],
  },
  {
    n: 2,
    title: "Protect",
    body: "Marketplace encrypts and stores off-chain via CDR + IPFS.",
    linestack: "CDR allocate/write · VPS IPFS proxy · Storacha",
    routes: ["/vaultline/create-vault"],
  },
  {
    n: 3,
    title: "Register",
    body: "Each contribution becomes a Story IP Asset — an on-chain deed.",
    linestack: "registerIpAsset + PIL license terms",
    routes: ["/vaultline/ip-register"],
  },
  {
    n: 4,
    title: "Bundle",
    body: "IP Assets compose into high-value datasets or listings.",
    linestack: "Queryline: dataset + allow-listed templates · Vaultline: listing",
    routes: ["/queryline/query-templates", "/vaultline/listings"],
  },
];

const STEPS_TRANSACT = [
  {
    n: 5,
    title: "Purchase",
    body: "Buyer pays with testnet IP / satisfies access conditions.",
    linestack: "buy-license · request-query (result vault)",
    routes: ["/vaultline/listings", "/queryline/request-query"],
  },
  {
    n: 6,
    title: "Verify",
    body: "Story mints license; CDR + validators choreograph access.",
    linestack: "CDR conditions · license mint · Automata DCAP on fulfill",
    routes: ["/queryline/dashboard"],
  },
  {
    n: 7,
    title: "Access",
    body: "Conditional decryption — keys released only when rules pass.",
    linestack: "unlock-file · fulfill → unlock-result (no raw dataset)",
    routes: ["/vaultline/unlock", "/queryline/results"],
  },
  {
    n: 8,
    title: "Earn",
    body: "Revenue flows to contributors via Story royalty + listing economics.",
    linestack: "PIL terms · audit tx hashes · shared registry",
    routes: ["/vaultline/audit", "/queryline/audit"],
  },
];

const COMPARE = [
  { old: "One-Time Payment", neu: "Recurring Income" },
  { old: "Loss of Control", neu: "Contributor Ownership" },
  { old: "Black Box", neu: "Auditable Proof" },
];

function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1280px] px-5 sm:px-8 py-10 sm:py-14">
        <p className="text-[13px] font-medium text-zinc-500 mb-2">Cipherline · Story Aeneid · CDR</p>
        <h1
          className="font-medium tracking-tight text-zinc-900 max-w-3xl"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
        >
          Turn Data into Programmable IP
        </h1>
        <p className="text-zinc-600 mt-4 max-w-2xl text-[15px] leading-relaxed">
          How Cipherline replaces one-time payouts and lost control with <strong>recurring, programmable IP</strong> on
          Story: contributors earn, buyers get audited access, and the chain sees real licenses and unlocks.{" "}
          <strong>Vaultline</strong> covers licensed files; <strong>Queryline</strong> covers licensed answers — eight
          steps, live on Aeneid (1315).
        </p>

        <div className="mt-10 grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
          {/* Status Quo */}
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-1">Status Quo</h2>
            <p className="text-sm text-red-800/80 mb-6">The problem we replace</p>
            <div className="space-y-0">
              {STATUS_QUO.map((s, i) => (
                <div key={s.label}>
                  <div className="rounded-xl bg-white/70 border border-red-100 px-4 py-3">
                    <div className="font-medium text-sm text-red-950">{s.label}</div>
                    <div className="text-xs text-red-800/70">{s.sub}</div>
                  </div>
                  {i < STATUS_QUO.length - 1 ? (
                    <div className="flex justify-center py-1 text-red-400" aria-hidden>
                      ↓
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <svg className="w-full h-12 mt-3 text-red-400/80" viewBox="0 0 200 40" aria-hidden>
              <path
                d="M 180 8 Q 200 20 180 32 L 24 32 Q 4 20 24 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <polygon points="24,8 18,12 24,16" fill="currentColor" />
            </svg>
            <p className="text-xs text-red-700 text-center italic">Data reused — no credit</p>
          </div>

          {/* New model header */}
          <div>
            <div className="rounded-t-2xl bg-[#1e3a5f] text-white px-6 py-4">
              <h2 className="text-lg sm:text-xl font-semibold">New Model</h2>
              <p className="text-sm text-blue-100 mt-1">CDR &amp; Story Powered Marketplace — Cipherline</p>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#1e3a5f] px-1 py-2">
              Phase 1 — Creation &amp; registration
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-t-0 border-zinc-200 rounded-b-2xl overflow-hidden">
              {STEPS_CREATE.map((s) => (
                <StepCard key={s.n} variant="create" {...s} />
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#2d6a3e] px-1 py-2 mt-4">
              Phase 2 — Transaction &amp; access
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-t-0 border-zinc-200 rounded-2xl overflow-hidden">
              {STEPS_TRANSACT.map((s) => (
                <StepCard key={s.n} variant="transact" {...s} />
              ))}
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-10 rounded-2xl border bg-white overflow-hidden max-w-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50">
                <th className="text-left px-4 py-3 font-semibold text-red-800">Status Quo</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1e3a5f]">New Model</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.old} className="border-b last:border-0">
                  <td className="px-4 py-3 text-red-900/90">{row.old}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">{row.neu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Diagrams — dark flow style (README parity) */}
        <div className="mt-12 space-y-6">
          <h2 className="text-lg font-semibold text-zinc-900">Architecture diagrams</h2>
          <p className="text-sm text-zinc-600 max-w-2xl -mt-2">
            Same models as{" "}
            <a href="https://github.com/henrysammarfo/linestack/blob/main/README.md" className="underline">
              README.md
            </a>{" "}
            — full stack, lifecycle, product split, and per-product access flows.
          </p>

          <FullStackDiagram />

          <MarketplaceLifecycleDiagram />

          <ProductSplitDiagram />

          <AccessFlowDiagram
            title="Vaultline access model"
            publisher={[
              { label: "encrypt + CDR vault", wide: false },
              { label: "Story IP + listing", wide: true },
            ]}
            buyer={[
              { label: "mint license", wide: false },
              { label: "unlock file", wide: false },
            ]}
            denyLabel="no license"
            footnote="Buyer decrypts only after PIL license + CDR read condition passes. Unauthorized wallets fail in audit."
          />

          <AccessFlowDiagram
            title="Queryline access model (honest)"
            publisher={[
              { label: "dataset vault", wide: false },
              { label: "fulfill: decrypt → template → write", wide: true },
            ]}
            buyer={[
              { label: "result vault", wide: false },
              { label: "unlock answer only", wide: false },
            ]}
            denyLabel="no access"
            footnote="Dataset vault → buyer: no access. Fulfill writes only to result vault (+ EIP-712 + Automata). Compute is publisher-side until CDR executeQuery."
          />
        </div>

        {/* Product rails */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <RailCard
            accent="bg-[#4f46e5]"
            title="Vaultline"
            subtitle="Steps 1–8 for files"
            copy="Upload → encrypt → Story IP → listing → license → conditional decrypt."
            to="/vaultline"
          />
          <RailCard
            accent="bg-[#3b6fa0]"
            title="Queryline"
            subtitle="Steps 1–8 for answers"
            copy="Dataset vault → templates → request → fulfill + attestation → result vault only."
            to="/queryline"
          />
        </div>

        <p className="text-sm text-zinc-600 mt-8 max-w-2xl">
          Full technical mapping:{" "}
          <a
            href="https://github.com/henrysammarfo/linestack/blob/main/docs/ARCHITECTURE.md"
            className="underline"
          >
            docs/ARCHITECTURE.md
          </a>
          . Queryline fulfill is publisher-side with vault isolation until Story enclave execute ships; Automata
          DCAP on-chain at fulfill.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white px-5 py-2 text-sm"
          >
            Live app <ArrowRight className="size-4" />
          </Link>
          <Link to="/mcp" className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2 text-sm">
            MCP tools
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function StepCard({
  n,
  title,
  body,
  linestack,
  routes,
  variant,
}: {
  n: number;
  title: string;
  body: string;
  linestack: string;
  routes: string[];
  variant: "create" | "transact";
}) {
  const bg = variant === "create" ? "bg-[#dce8f5]" : "bg-[#d4edda]";
  const badge = variant === "create" ? "bg-[#1e3a5f]" : "bg-[#2d6a3e]";
  return (
    <div className={`${bg} p-4 border-r border-white/50 last:border-r-0 min-h-[200px] flex flex-col`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`size-7 rounded-md ${badge} text-white text-xs font-bold flex items-center justify-center`}>
          {n}
        </span>
        <span className="font-semibold text-sm text-zinc-900">{title}</span>
      </div>
      <p className="text-xs text-zinc-700 leading-relaxed flex-1">{body}</p>
      <div className="mt-3 pt-3 border-t border-zinc-900/10">
        <p className="text-[10px] uppercase tracking-wide text-zinc-600 mb-1">Cipherline</p>
        <p className="text-xs font-medium text-zinc-900 leading-snug">{linestack}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {routes.map((r) => (
            <Link key={r} to={r} className="text-[10px] underline text-zinc-800">
              {r}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function RailCard({
  accent,
  title,
  subtitle,
  copy,
  to,
}: {
  accent: string;
  title: string;
  subtitle: string;
  copy: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border bg-white p-6 hover:shadow-md transition-shadow"
    >
      <span className={`inline-block size-8 rounded-lg ${accent} mb-3`} />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-xs text-zinc-500 mb-2">{subtitle}</p>
      <p className="text-sm text-zinc-600">{copy}</p>
    </Link>
  );
}
