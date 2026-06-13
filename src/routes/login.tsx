import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Wallet } from "lucide-react";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { Clearance402Logo } from "@/components/brand/Clearance402Logo";
import { useConnection } from "@/lib/connection";
import { navigateToRedirect } from "@/lib/navigation/redirect-path";
import { CLEARANCE_CHAIN_ID } from "@/lib/clearance/network";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/dashboard",
  }),
  head: () => ({ meta: [{ title: "Connect wallet · Clearance402" }] }),
  component: ConnectPage,
});

function ConnectPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { isConnected, isWrongChain, walletAddress, config, status } = useConnection();
  const walletPending = status === "connecting";

  useEffect(() => {
    if (walletPending || !isConnected) return;
    navigateToRedirect(navigate, redirect);
  }, [isConnected, walletPending, navigate, redirect]);

  return (
    <div className="min-h-screen bg-[#EFEFEF] flex flex-col">
      <SiteHeader />
      <section className="flex-1 mx-auto max-w-[460px] w-full px-5 sm:px-8 py-12">
        <div className="rounded-3xl border bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-6">
            <Clearance402Logo size={40} title="Clearance402" />
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-zinc-900">Clearance402</p>
              <p className="text-[12px] text-zinc-500">Agent payment trust layer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500 mb-4">
            <Wallet className="size-3.5" /> Clearance402 access
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Connect your wallet</h1>
          <p className="text-sm text-zinc-600 mt-1.5">
            Clearance402 uses your wallet on the configured network (chain {CLEARANCE_CHAIN_ID}) for operator access,
            payment checks, and audit permissions.
          </p>

          <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border bg-zinc-50 p-6">
            <WalletConnect />
            {isWrongChain && (
              <p className="text-xs text-chain-failed text-center">
                Wrong network — switch MetaMask to the configured Clearance402 network.
              </p>
            )}
            {walletAddress && !isConnected && !isWrongChain && (
              <p className="text-xs text-muted-foreground text-center">Connecting…</p>
            )}
          </div>

          <div className="mt-6 space-y-2 text-[12px] text-zinc-600">
            <p>
              <strong className="text-zinc-900">First time?</strong> Switch MetaMask to{" "}
              <strong>Base Sepolia</strong> and fund with{" "}
              <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="underline">
                test USDC
              </a>{" "}
              and{" "}
              <a href="https://www.alchemy.com/faucets/base-sepolia" target="_blank" rel="noreferrer" className="underline">
                test ETH
              </a>
              .
            </p>
            <p>
              RPC from env ·{" "}
              <Link to="/settings" className="text-zinc-900 font-medium hover:underline">
                Settings
              </Link>
            </p>
          </div>

          <Button
            type="button"
            className="w-full mt-6 group"
            disabled={!isConnected}
            onClick={() => navigateToRedirect(navigate, redirect)}
          >
            Open console
            <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </Button>

          <p className="mt-6 text-[12px] text-zinc-500">
            Building with the SDK?{" "}
            <Link to="/docs" className="text-zinc-900 font-medium hover:underline">
              Read the docs
            </Link>
            .
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
