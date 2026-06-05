import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Vault, ShieldCheck, Tag, Unlock, Activity, Terminal } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/vaultline/")({
  head: () => ({
    meta: [
      { title: "Vaultline — Sell licensed private files on Story" },
      {
        name: "description",
        content:
          "Monetize reports, datasets, and creator packs: encrypt, register as Story IP, sell licenses, buyers unlock with real CDR decrypt.",
      },
      { property: "og:title", content: "Vaultline — Line Stack" },
      { property: "og:description", content: "Pay-to-unlock private files on Story Aeneid — for creators, analysts, and buyers." },
    ],
  }),
  component: VaultlineLanding,
});

function VaultlineLanding() {
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 pt-10 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <span className="size-9 rounded-xl bg-[#F26522] text-white flex items-center justify-center"><Vault className="size-5" /></span>
          <span className="text-[13px] font-medium text-zinc-600">Vaultline</span>
        </div>
        <h1 className="font-medium leading-[1.06] tracking-[-0.03em] text-zinc-900 max-w-4xl" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
          Sell private files with a license — not a Drive link.
        </h1>
        <p className="text-zinc-600 max-w-2xl mt-6 text-[15px] leading-relaxed">
          For creators, analysts, and teams with valuable CSVs, PDFs, or research packs. Upload into a CDR vault,
          register as Story IP, set price and license terms, and let buyers pay on-chain before they can decrypt.
          Unauthorized wallets fail; every sale and unlock is in the audit log with a real tx hash.
        </p>
        <p className="text-zinc-500 max-w-2xl mt-4 text-[14px] leading-relaxed">
          Story builders can also embed the same flow via SDK, CLI, and MCP — so new apps bring buyers onto the chain.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/vaultline/dashboard" className="group bg-zinc-900 text-white rounded-full pl-5 pr-2 py-2 inline-flex items-center gap-2 text-[14px]">
            Open dashboard
            <span className="size-7 rounded-full bg-white text-zinc-900 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
          <Link to="/vaultline/developer-console" className="rounded-full bg-white border px-5 py-2 text-[14px]">Developer console</Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
          {[
            { icon: <Vault className="size-5" />, label: "Create vault", to: "/vaultline/create-vault", copy: "Define access policy and license intent." },
            { icon: <ShieldCheck className="size-5" />, label: "Register IP", to: "/vaultline/ip-register", copy: "Anchor vault as a Story IP Asset." },
            { icon: <Tag className="size-5" />, label: "Listings", to: "/vaultline/listings", copy: "Price, license terms, currency." },
            { icon: <Unlock className="size-5" />, label: "Unlock", to: "/vaultline/unlock", copy: "Buyer-side decrypt via held license." },
            { icon: <Activity className="size-5" />, label: "Audit log", to: "/vaultline/audit", copy: "Every action with a Story tx hash." },
            { icon: <Terminal className="size-5" />, label: "Developer console", to: "/vaultline/developer-console", copy: "SDK, CLI, MCP snippets." },
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
