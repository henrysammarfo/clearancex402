import type { ReactNode } from "react";

/** Dark flow diagrams — consistent style across architecture page & README parity */

export function FlowBox({ label, wide }: { label: string; wide?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border border-zinc-500 bg-zinc-800 px-3 py-2 text-xs text-zinc-100 text-center leading-snug ${
        wide ? "min-w-[180px] max-w-full sm:min-w-[220px]" : "min-w-[88px] sm:min-w-[100px]"
      }`}
    >
      {label}
    </span>
  );
}

function DiagramShell({ title, children, footnote }: { title: string; children: ReactNode; footnote?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 text-white p-5 sm:p-6">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {children}
      {footnote ? <p className="text-[10px] text-zinc-500 mt-3 leading-relaxed">{footnote}</p> : null}
    </div>
  );
}

/** Publisher / Buyer lanes with optional dashed deny on protected asset */
export function AccessFlowDiagram({
  title,
  publisher,
  buyer,
  denyLabel,
  footnote,
}: {
  title: string;
  publisher: { label: string; wide?: boolean }[];
  buyer: { label: string; wide?: boolean }[];
  denyLabel?: string;
  footnote?: string;
}) {
  return (
    <DiagramShell title={title} footnote={footnote}>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-3 items-stretch relative min-h-[100px]">
        <Lane title="Publisher" items={publisher} />
        <div className="flex lg:flex-col items-center justify-center text-zinc-400 shrink-0 py-1 lg:py-8" aria-hidden>
          <span className="text-lg lg:rotate-0">→</span>
        </div>
        <Lane title="Buyer" items={buyer} />
        {denyLabel ? (
          <div
            className="pointer-events-none absolute inset-x-[8%] top-[42%] hidden lg:block"
            aria-hidden
          >
            <div className="border-t border-dashed border-zinc-500 relative">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 px-2 text-[10px] text-zinc-400 whitespace-nowrap">
                {denyLabel}
              </span>
            </div>
          </div>
        ) : null}
      </div>
      {denyLabel ? (
        <p className="text-[10px] text-zinc-500 mt-2 lg:hidden">
          Protected asset: <span className="italic">{denyLabel}</span>
        </p>
      ) : null}
    </DiagramShell>
  );
}

function Lane({ title, items }: { title: string; items: { label: string; wide?: boolean }[] }) {
  return (
    <div className="flex-1 rounded-xl border border-zinc-600 p-4 relative z-1">
      <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3">{title}</p>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <span key={item.label} className="flex items-center gap-2">
            {i > 0 ? <span className="text-zinc-500" aria-hidden>→</span> : null}
            <FlowBox label={item.label} wide={item.wide} />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Eight-step CDR + Story lifecycle — same dark box style */
export function MarketplaceLifecycleDiagram() {
  const phase1 = [
    { n: 1, label: "Upload" },
    { n: 2, label: "Protect" },
    { n: 3, label: "Register" },
    { n: 4, label: "Bundle" },
  ];
  const phase2 = [
    { n: 5, label: "Purchase" },
    { n: 6, label: "Verify" },
    { n: 7, label: "Access" },
    { n: 8, label: "Earn" },
  ];

  return (
    <DiagramShell
      title="Eight-step marketplace lifecycle (CDR + Story)"
      footnote="Vaultline maps steps 1–8 to files · Queryline maps 1–8 to licensed answers · Live routes on /architecture"
    >
      <PhaseRow title="Phase 1 — Creation & registration" steps={phase1} accent="border-blue-500/40" />
      <div className="flex justify-center py-2 text-zinc-500" aria-hidden>
        ↓
      </div>
      <PhaseRow title="Phase 2 — Transaction & access" steps={phase2} accent="border-emerald-500/40" />
    </DiagramShell>
  );
}

function PhaseRow({
  title,
  steps,
  accent,
}: {
  title: string;
  steps: { n: number; label: string }[];
  accent: string;
}) {
  return (
    <div className={`rounded-xl border ${accent} p-4 mb-2 last:mb-0`}>
      <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3">{title}</p>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => (
          <span key={s.n} className="flex items-center gap-2">
            {i > 0 ? <span className="text-zinc-500" aria-hidden>→</span> : null}
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-500 bg-zinc-800 px-2.5 py-2 text-xs">
              <span className="size-5 rounded bg-zinc-700 text-[10px] font-bold flex items-center justify-center">{s.n}</span>
              <span className="text-zinc-100">{s.label}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Full production stack — top to bottom */
export function FullStackDiagram() {
  const layers: { title: string; nodes: string[]; note?: string }[] = [
    {
      title: "Users",
      nodes: ["Publisher (sell data)", "Buyer (pay & unlock)", "Builder / AI agent"],
    },
    {
      title: "Web app · Vercel",
      nodes: ["linestack.vercel.app", "Vaultline · Queryline · Audit · /architecture"],
      note: "Browser → HTTPS /api/story-api proxy (no mixed content)",
    },
    {
      title: "Agents · same registry & txs",
      nodes: ["@line-stack/mcp-server (17 tools)", "@line-stack/cli", "@line-stack/sdk"],
    },
    {
      title: "Shared services · VPS",
      nodes: ["Registry API (listings, datasets, requests)", "IPFS proxy (pin / get)", "Story-API upstream"],
    },
    {
      title: "Story Aeneid · chain 1315",
      nodes: [
        "CDR allocate / write / accessCDR",
        "PIL license mint",
        "LINESTACK conditions & registries",
        "Automata DCAP (Queryline fulfill)",
      ],
    },
  ];

  return (
    <DiagramShell
      title="Clearance402 — full stack"
      footnote="One marketplace state (registry) across web, CLI, SDK, and MCP — every critical path uses real Story/CDR txs on testnet."
    >
      <div className="space-y-2">
        {layers.map((layer, i) => (
          <div key={layer.title}>
            <div className="rounded-xl border border-zinc-600 p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2">{layer.title}</p>
              <div className="flex flex-wrap gap-2">
                {layer.nodes.map((n) => (
                  <FlowBox key={n} label={n} wide={n.length > 28} />
                ))}
              </div>
              {layer.note ? <p className="text-[10px] text-zinc-500 mt-2">{layer.note}</p> : null}
            </div>
            {i < layers.length - 1 ? (
              <div className="flex justify-center py-1 text-zinc-500 text-sm" aria-hidden>
                ↓
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

/** Vaultline + Queryline split under shared CDR layer */
export function ProductSplitDiagram() {
  return (
    <DiagramShell
      title="Product split on shared CDR"
      footnote="Not two backends — one Clearance402 core (cdr-core, registry, conditions) with two user-facing products."
    >
      <div className="flex justify-center mb-3">
        <FlowBox label="Story Aeneid + CDR + registry" wide />
      </div>
      <div className="flex justify-center text-zinc-500 py-1" aria-hidden>
        ↓
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#4f46e5]/50 p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#4f46e5] mb-3">Vaultline</p>
          <div className="flex flex-wrap items-center gap-2">
            <FlowBox label="encrypt file" />
            <span className="text-zinc-500">→</span>
            <FlowBox label="Story IP" />
            <span className="text-zinc-500">→</span>
            <FlowBox label="license" />
            <span className="text-zinc-500">→</span>
            <FlowBox label="decrypt file" />
          </div>
        </div>
        <div className="rounded-xl border border-[#3b6fa0]/50 p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#3b6fa0] mb-3">Queryline</p>
          <div className="flex flex-wrap items-center gap-2">
            <FlowBox label="dataset vault" />
            <span className="text-zinc-500">→</span>
            <FlowBox label="fulfill" wide />
            <span className="text-zinc-500">→</span>
            <FlowBox label="result vault" />
            <span className="text-zinc-500">→</span>
            <FlowBox label="answer only" />
          </div>
        </div>
      </div>
    </DiagramShell>
  );
}
