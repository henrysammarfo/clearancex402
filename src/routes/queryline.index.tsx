import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Database, ListChecks, Send, FileSearch, Activity, Terminal } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/queryline/")({
  head: () => ({
    meta: [
      { title: "Queryline — Sell answers from private datasets on Story" },
      {
        name: "description",
        content:
          "Buyers pay for allow-listed query results in a result vault. Raw dataset stays locked in CDR — due diligence, benchmarks, analytics.",
      },
      { property: "og:title", content: "Queryline — Line Stack" },
      { property: "og:description", content: "Pay for insights without buying the raw dataset — on Story Aeneid." },
    ],
  }),
  component: QuerylineLanding,
});

function QuerylineLanding() {
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 pt-10 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <span className="size-9 rounded-xl bg-[#3b6fa0] text-white flex items-center justify-center"><Database className="size-5" /></span>
          <span className="text-[13px] font-medium text-zinc-600">Queryline</span>
        </div>
        <h1 className="font-medium leading-[1.06] tracking-[-0.03em] text-zinc-900 max-w-4xl" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
          Sell answers — buyers never get the raw dataset.
        </h1>
        <p className="text-zinc-600 max-w-2xl mt-6 text-[15px] leading-relaxed">
          For data owners with confidential benchmarks, campaign analytics, or due-diligence files. Keep rows in a
          dataset vault only you can read. Buyers request an allow-listed template (e.g. average by region); you
          fulfill into their result vault. They unlock the answer — not the full file — with EIP-712 and Automata
          attestation on-chain.
        </p>
        <p className="text-zinc-500 max-w-2xl mt-4 text-[14px] leading-relaxed">
          A real use case people will pay for today; SDK/MCP lets agents and Story apps run the same request → fulfill → unlock loop.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/queryline/dashboard" className="group bg-zinc-900 text-white rounded-full pl-5 pr-2 py-2 inline-flex items-center gap-2 text-[14px]">
            Open dashboard
            <span className="size-7 rounded-full bg-white text-zinc-900 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
          <Link to="/queryline/developer-console" className="rounded-full bg-white border px-5 py-2 text-[14px]">Developer console</Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
          {[
            { icon: <Database className="size-5" />, label: "Create dataset", to: "/queryline/create-dataset", copy: "Define schema + access policy." },
            { icon: <ListChecks className="size-5" />, label: "Query templates", to: "/queryline/query-templates", copy: "Allow-list parameterized queries." },
            { icon: <Send className="size-5" />, label: "Request query", to: "/queryline/request-query", copy: "Buyer allocates a result vault for a template + params." },
            { icon: <FileSearch className="size-5" />, label: "Results", to: "/queryline/results", copy: "Per-buyer result vaults." },
            { icon: <Activity className="size-5" />, label: "Audit log", to: "/queryline/audit", copy: "Every action with a Story tx hash." },
            { icon: <Terminal className="size-5" />, label: "Developer console", to: "/queryline/developer-console", copy: "SDK, CLI, MCP snippets." },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="rounded-2xl border bg-white p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-shadow">
              <span className="size-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-3">{c.icon}</span>
              <h3 className="text-[16px] font-semibold mb-1">{c.label}</h3>
              <p className="text-[14px] text-zinc-600">{c.copy}</p>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
