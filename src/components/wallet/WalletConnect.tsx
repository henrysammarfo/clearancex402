import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2, Wallet, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lightweight, on-brand wallet button built on RainbowKit's headless render
 * props. Surfaces clear loading, wrong-network, and connected states instead
 * of the default RainbowKit chrome.
 */
export function WalletConnect({ className }: { className?: string }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        const base =
          "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors";

        if (!ready) {
          return (
            <span
              aria-hidden
              className={cn(base, "bg-zinc-100 text-zinc-400", className)}
            >
              <Loader2 className="size-3.5 animate-spin" />
              Loading…
            </span>
          );
        }

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className={cn(base, "bg-zinc-900 text-white hover:bg-zinc-800", className)}
            >
              <Wallet className="size-3.5" />
              Connect wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className={cn(base, "bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100", className)}
            >
              <AlertTriangle className="size-3.5" />
              Wrong network
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openAccountModal}
            className={cn(
              base,
              "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:ring-zinc-300",
              className,
            )}
          >
            <span className="size-2 rounded-full bg-emerald-500" />
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
