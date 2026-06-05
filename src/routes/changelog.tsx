import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/changelog")({
  head: () => ({ meta: [{ title: "Cipherline · Changelog" }] }),
  component: () => (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[820px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl font-medium tracking-tight">Changelog</h1>
        <ol className="mt-8 space-y-6">
          <li className="rounded-2xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">v0.1.0 — CDR Hackathon release</h3>
              <span className="text-xs text-muted-foreground">2026-06-02</span>
            </div>
            <p className="text-sm text-zinc-600 mt-2">
              Production deploy on Vercel, Automata DCAP on Queryline fulfill, RainbowKit wallet, vault detail pages,
              MCP tool explorer (17 tools), agent integrations docs, CLI/SDK/MCP parity with shared VPS registry.
            </p>
          </li>
          <li className="rounded-2xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">v0.0.1 — Foundation</h3>
              <span className="text-xs text-muted-foreground">2026-05-27</span>
            </div>
            <p className="text-sm text-zinc-600 mt-2">
              Initial Vaultline and Queryline UI, cdr-core package, Settings for RPC/CDR endpoints, developer consoles.
            </p>
          </li>
        </ol>
      </section>
      <SiteFooter />
    </div>
  ),
});
