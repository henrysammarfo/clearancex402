import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Wallet, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Step = { title: string; copy: string; to?: string; toLabel?: string };

const WEB2_STEPS: Step[] = [
  {
    title: "Read the 60-second overview",
    copy: "Clearance402 checks a paid tool before your agent pays for it — protocol, price, output, and permissions.",
    to: "/docs",
    toLabel: "Open docs",
  },
  {
    title: "Browse verified tools",
    copy: "See live Trust Cards with a simple ALLOW / WARN / BLOCK decision. No wallet needed to look around.",
    to: "/tools",
    toLabel: "Browse tools",
  },
  {
    title: "Try a guided run",
    copy: "Watch an end-to-end clearance happen step by step in the agent demo — nothing to install.",
    to: "/agent-demo",
    toLabel: "Open agent demo",
  },
];

const WEB3_STEPS: Step[] = [
  {
    title: "Connect a wallet",
    copy: "Use MetaMask on the configured Clearance402 network to unlock operator actions and signed audit access.",
    to: "/login",
    toLabel: "Connect wallet",
  },
  {
    title: "Onboard your tool",
    copy: "Register an x402/MCP endpoint, run a live probe, and get a Trust Card with proof and integration snippets.",
    to: "/tool-onboarding",
    toLabel: "Onboard a tool",
  },
  {
    title: "Wire it into your agent",
    copy: "Drop the SDK, CLI, or agent connector into your stack and clear every payment before it happens.",
    to: "/sdk",
    toLabel: "Open the SDK",
  },
];

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 flex gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <span className="size-7 shrink-0 rounded-full bg-[#4f46e5] text-white text-[13px] font-semibold flex items-center justify-center">
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-[15px] text-zinc-900">{s.title}</p>
            <p className="text-[13.5px] text-zinc-600 mt-1 leading-relaxed">{s.copy}</p>
            {s.to && (
              <Link
                to={s.to}
                className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#4f46e5] hover:underline"
              >
                {s.toLabel}
                <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Shared "Get started" onboarding block with calm web2 and web3 paths.
 * Reused across Docs, SDK, CLI, and Agent tools.
 */
export function GetStarted({
  className,
  heading = "Get started",
  intro = "Two calm paths — whether you have never touched a wallet or you ship agents for a living.",
}: {
  className?: string;
  heading?: ReactNode;
  intro?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-zinc-200 bg-[#F7F7F8] p-5 sm:p-7",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Sparkles className="size-4 text-[#4f46e5]" />
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4f46e5]">Onboarding</p>
      </div>
      <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-zinc-900">{heading}</h2>
      <p className="text-[14px] text-zinc-600 mt-2 max-w-xl leading-relaxed">{intro}</p>

      <Tabs defaultValue="web2" className="mt-5">
        <TabsList className="bg-white border border-zinc-200 rounded-full p-1 h-auto">
          <TabsTrigger
            value="web2"
            className="rounded-full px-4 py-1.5 text-[13px] data-[state=active]:bg-[#4f46e5] data-[state=active]:text-white"
          >
            <Compass className="size-3.5 mr-1.5" />
            New to this
          </TabsTrigger>
          <TabsTrigger
            value="web3"
            className="rounded-full px-4 py-1.5 text-[13px] data-[state=active]:bg-[#4f46e5] data-[state=active]:text-white"
          >
            <Wallet className="size-3.5 mr-1.5" />
            Web3 builder
          </TabsTrigger>
        </TabsList>
        <TabsContent value="web2" className="mt-4">
          <StepList steps={WEB2_STEPS} />
        </TabsContent>
        <TabsContent value="web3" className="mt-4">
          <StepList steps={WEB3_STEPS} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
