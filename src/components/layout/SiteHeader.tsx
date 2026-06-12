import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useConnection } from "@/lib/connection";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { ConnectDialog } from "@/components/wallet/ConnectDialog";
import { Clearance402Logo } from "@/components/brand/Clearance402Logo";

const NAV = [
  { to: "/tools", label: "Tools" },
  { to: "/agent-clearance", label: "Agent clearance" },
  { to: "/payment-lab", label: "Payment lab" },
  { to: "/docs", label: "Docs" },
  { to: "/mcp", label: "Agent tools" },
];

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
    <div className="fixed inset-0 z-[200] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[min(88vh,640px)] flex-col rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300">
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
  const [connectOpen, setConnectOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isConnected } = useConnection();
  const onConnectPage = pathname === "/login";

  const close = () => setOpen(false);

  const openConsole = () => {
    if (isConnected) {
      navigate({ to: "/dashboard" });
    } else {
      setConnectOpen(true);
    }
  };

  return (
    <div className={cn("relative z-30 w-full", variant === "light" && "bg-transparent")}>
      <div className="mx-auto max-w-[1280px] px-3 pt-3 sm:px-5 sm:pt-4">
        <nav className="bg-white/90 backdrop-blur rounded-full p-1.5 pl-2 flex items-center justify-between gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04]">
          {/* Brand + primary nav */}
          <div className="flex items-center gap-7 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <Clearance402Logo size={32} />
              <span className="text-[15px] font-semibold tracking-tight text-zinc-900">Clearance402</span>
            </Link>
            <div className="hidden lg:flex items-center gap-6">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "text-[14px] transition-colors hover:text-zinc-900",
                    pathname.startsWith(n.to) ? "text-zinc-900 font-medium" : "text-zinc-500",
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {!onConnectPage &&
              (isConnected ? (
                <WalletConnect />
              ) : (
                <button
                  type="button"
                  onClick={() => setConnectOpen(true)}
                  className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-full transition-colors"
                >
                  Connect wallet
                </button>
              ))}
            <button
              type="button"
              onClick={openConsole}
              className="group bg-zinc-900 text-white text-[13px] font-medium rounded-full pl-4 pr-1.5 py-1.5 flex items-center gap-2"
            >
              Open console
              <span className="size-6 rounded-full bg-white text-zinc-900 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45">
                <ArrowRight className="size-3.5" />
              </span>
            </button>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="md:hidden size-9 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </nav>
      </div>

      <MobileNavSheet open={open} onClose={close}>
        <div className="flex items-center justify-between mb-6">
          <Link to="/" onClick={close} className="flex items-center gap-2">
            <Clearance402Logo size={30} />
            <span className="text-[15px] font-semibold tracking-tight text-zinc-900">Clearance402</span>
          </Link>
          <button
            type="button"
            onClick={close}
            className="size-9 rounded-full bg-zinc-100 flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={close}
              className="text-[19px] leading-none font-medium text-zinc-900 py-3 border-b border-zinc-100 last:border-0"
            >
              {n.label}
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {!onConnectPage &&
            (isConnected ? (
              <WalletConnect className="w-full justify-center py-3" />
            ) : (
              <button
                type="button"
                onClick={() => {
                  close();
                  setConnectOpen(true);
                }}
                className="inline-flex w-full justify-center rounded-full border border-zinc-200 text-zinc-900 text-[14px] font-medium px-4 py-3"
              >
                Connect wallet
              </button>
            ))}
          <button
            type="button"
            onClick={() => {
              close();
              openConsole();
            }}
            className="inline-flex items-center justify-between bg-zinc-900 text-white rounded-full pl-5 pr-1.5 py-2.5"
          >
            <span className="text-[14px] font-medium">Open console</span>
            <span className="size-7 rounded-full bg-white text-zinc-900 flex items-center justify-center">
              <ArrowRight className="size-3.5" />
            </span>
          </button>
        </div>
      </MobileNavSheet>

      <ConnectDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </div>
  );
}
