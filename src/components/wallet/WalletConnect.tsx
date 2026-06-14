import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2, Wallet, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type WalletConnectProps = {
  className?: string;
  /** Close mobile nav / other overlays before RainbowKit opens (avoids blocked clicks). */
  onBeforeConnect?: () => void;
  variant?: "solid" | "ghost";
};

/** Defer so parent modals (Radix, mobile sheet) unmount and release pointer-events. */
function openRainbowModal(open: () => void, onBefore?: () => void) {
  onBefore?.();
  window.setTimeout(() => open(), 0);
}

/**
 * Lightweight, on-brand wallet button built on RainbowKit's headless render
 * props. Surfaces clear loading, wrong-network, and connected states instead
 * of the default RainbowKit chrome.
 */
export function WalletConnect({
  className,
  onBeforeConnect,
  variant = "solid",
}: WalletConnectProps) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        const base =
          "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer";

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
              onClick={() => openRainbowModal(openConnectModal, onBeforeConnect)}
              className={cn(
                base,
                variant === "ghost"
                  ? "bg-transparent text-zinc-600 hover:text-zinc-900 px-3"
                  : "bg-zinc-900 text-white hover:bg-zinc-800",
                className,
              )}
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
              onClick={() => openRainbowModal(openChainModal, onBeforeConnect)}
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
