import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { cn } from "@/lib/utils";

const DEV_NAV = [
  { to: "/docs", label: "Docs" },
  { to: "/sdk", label: "SDK" },
  { to: "/cli", label: "CLI" },
  { to: "/mcp", label: "Agent tools" },
  { to: "/agent-demo", label: "Agent demo" },
];

export function DevPageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[1080px] px-5 sm:px-8 py-10 lg:py-14">
        {/* Hero */}
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4f46e5] mb-3">{eyebrow}</p>
          <h1 className="text-3xl sm:text-[40px] font-medium tracking-tight text-zinc-900 leading-[1.1]">{title}</h1>
          <p className="text-zinc-600 mt-4 text-[15px] sm:text-[16px] leading-relaxed">{intro}</p>
        </header>

        {/* Sub-nav */}
        <nav className="mt-8 flex flex-wrap gap-2">
          {DEV_NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-medium border transition-colors",
                  active
                    ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-sm"
                    : "bg-white text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:border-zinc-300",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10">{children}</div>
      </section>
      <SiteFooter />
    </div>
  );
}

/** A calm, titled content block used across developer pages. */
export function DevSection({
  step,
  title,
  description,
  children,
}: {
  step?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-3">
        {step && <span className="font-mono text-[13px] font-semibold text-[#4f46e5] shrink-0">{step}</span>}
        <div>
          <h2 className="text-xl font-medium tracking-tight text-zinc-900">{title}</h2>
          {description && <p className="text-[14px] text-zinc-600 mt-1.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function DevCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
