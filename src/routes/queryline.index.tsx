import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Activity, Boxes, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/queryline/")({
  head: () => ({
    meta: [
      { title: "Legacy route moved · Clearance402" },
      {
        name: "description",
        content: "This legacy workflow has moved to the Clearance402 trust and clearance console.",
      },
    ],
  }),
  component: LegacyQueryline,
});

function LegacyQueryline() {
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[980px] px-5 sm:px-8 py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4f46e5] mb-3">Legacy route</p>
        <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-zinc-900">This workflow moved to Clearance402.</h1>
        <p className="text-zinc-600 mt-4 max-w-2xl text-[15px] leading-relaxed">
          The old dataset workflow is retired. Use Clearance402 to verify paid tools, evaluate model output,
          clear agent payments, and export audit evidence.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: <Boxes className="size-5" />, title: "Tool registry", to: "/tools", copy: "Trust cards for paid services." },
            { icon: <ShieldCheck className="size-5" />, title: "Agent clearance", to: "/agent-clearance", copy: "ALLOW, WARN, BLOCK, RETEST, or HUMAN." },
            { icon: <Activity className="size-5" />, title: "Audit log", to: "/audit", copy: "Filter and export clearance events." },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="rounded-2xl border bg-white p-5 hover:shadow-md transition-shadow">
              <span className="size-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-3">{item.icon}</span>
              <h2 className="font-semibold text-zinc-900">{item.title}</h2>
              <p className="text-sm text-zinc-600 mt-1">{item.copy}</p>
            </Link>
          ))}
        </div>
        <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white px-5 py-2 text-sm">
          Open Clearance402 console <ArrowRight className="size-4" />
        </Link>
      </section>
      <SiteFooter />
    </div>
  );
}
