import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Clock, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { useAuth } from "@/lib/auth";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { LineStackLogo } from "@/components/brand/LineStackLogo";

const NAV = [
  { to: "/tools", label: "Tools" },
  { to: "/agent-clearance", label: "Agent clearance" },
  { to: "/payment-lab", label: "Payment lab" },
  { to: "/docs", label: "Docs" },
  { to: "/mcp", label: "MCP" },
];

function LondonClock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () => {
      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setTime(fmt.format(new Date()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-[13px] text-zinc-600">{time} in London</span>;
}

function MobileNavSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[min(88vh,640px)] flex-col rounded-t-2xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="overflow-y-auto overscroll-contain p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function SiteHeader({ variant = "light" }: { variant?: "light" | "transparent" }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAuthenticated, session } = useAuth();
  const { isConnected: walletConnected } = useAccount();
  const canOpenConsole = isAuthenticated || walletConnected;
  const onConnectPage = pathname === "/login";

  const close = () => setOpen(false);

  return (
    <div className={cn("relative z-30 w-full", variant === "light" && "bg-transparent")}>
      <div className="mx-auto max-w-[1440px] p-2 sm:p-3">
        <nav className="bg-white rounded-full p-[5px] flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-6 pl-1">
            <Link to="/" className="flex items-center gap-2">
              <LineStackLogo size={40} className="sm:hidden" />
              <LineStackLogo size={44} className="hidden sm:block" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "text-[14px] transition-colors duration-300 hover:text-zinc-500",
                    pathname.startsWith(n.to) ? "text-zinc-900 font-medium" : "text-zinc-900",
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 pr-1">
            <span className="hidden lg:inline text-[13px] text-zinc-600">x402 · MCP · agent-native</span>
            <div className="hidden lg:inline-flex items-center gap-1.5 text-zinc-600">
              <Clock className="size-3.5" />
              <LondonClock />
            </div>
            {isAuthenticated && session && (
              <span className="hidden xl:inline text-[12px] text-zinc-500 max-w-[160px] truncate">
                {session.workspace}
              </span>
            )}
            {!onConnectPage && walletConnected && <WalletConnect />}
            {!onConnectPage && !walletConnected && (
              <Link
                to="/login"
                search={{ redirect: "/dashboard" }}
                className="rounded-full bg-zinc-900 text-white text-[13px] font-medium px-4 py-2 hover:bg-zinc-800"
              >
                Connect wallet
              </Link>
            )}
            <Link
              to="/dashboard"
              className="group bg-zinc-900 text-white text-[13px] font-medium rounded-full pl-5 pr-2 py-2 flex items-center gap-2 shrink-0"
            >
              <span className="overflow-hidden h-[20px] flex flex-col items-start">
                <span className="block transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                  Open console
                </span>
                <span className="block">Open console</span>
              </span>
              <span className="size-6 rounded-full bg-white text-zinc-900 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="md:hidden size-10 rounded-full bg-zinc-900 text-white flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </nav>
      </div>

      <MobileNavSheet open={open} onClose={close}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-[13px] text-zinc-600">
            <Clock className="size-3.5" /> <LondonClock />
          </div>
          <button
            type="button"
            onClick={close}
            className="size-9 rounded-full bg-zinc-100 flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {!onConnectPage && (
            <div className="mb-2">
              {walletConnected ? (
                <WalletConnect />
              ) : (
                <Link
                  to="/login"
                  search={{ redirect: "/dashboard" }}
                  onClick={close}
                  className="inline-flex w-full justify-center rounded-full bg-zinc-900 text-white text-[13px] font-medium px-4 py-2.5"
                >
                  Connect wallet
                </Link>
              )}
            </div>
          )}
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={close}
              className="text-[28px] leading-[32px] font-medium text-zinc-900"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/dashboard"
            onClick={close}
            className="mt-4 inline-flex items-center justify-between bg-zinc-900 text-white rounded-full pl-5 pr-2 py-2"
          >
            <span className="text-[13px] font-medium">Open console</span>
            <span className="size-7 rounded-full bg-white text-zinc-900 flex items-center justify-center">
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </div>
      </MobileNavSheet>
    </div>
  );
}
