import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, AlertTriangle, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useConnection } from "@/lib/connection";
import { cn } from "@/lib/utils";

/**
 * Friendly connect experience used to gate the console. Calm copy for web2
 * newcomers, a real wallet button for web3 users, plus loading and
 * wrong-network messaging.
 */
export function ConnectDialog({
  open,
  onOpenChange,
  redirect = "/dashboard",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  redirect?: string;
}) {
  const navigate = useNavigate();
  const { isConnected: walletConnected } = useAccount();
  const { isConnected, isWrongChain, status } = useConnection();
  const connecting = status === "connecting";

  /** Radix Dialog blocks pointer events on portaled siblings (RainbowKit). Close first. */
  const openWalletModal = (openModal: () => void) => {
    onOpenChange(false);
    window.setTimeout(() => openModal(), 100);
  };

  // When the wallet finishes connecting on the right chain, move along.
  useEffect(() => {
    if (open && isConnected) {
      onOpenChange(false);
      navigate({ to: redirect });
    }
  }, [open, isConnected, navigate, redirect, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl">
        <DialogHeader>
          <div className="size-11 rounded-2xl bg-[#4f46e5] text-white flex items-center justify-center mb-1">
            <ShieldCheck className="size-5" />
          </div>
          <DialogTitle className="text-[20px] tracking-tight">Connect to Clearance402</DialogTitle>
          <DialogDescription className="text-[14px] leading-relaxed">
            Clearance402 uses your wallet to authorize operator actions, run payment checks, and sign audit
            access. New to wallets? It only takes a minute.
          </DialogDescription>
        </DialogHeader>

        {/* State messaging */}
        {connecting && (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 ring-1 ring-zinc-200 px-3 py-2.5 text-[13px] text-zinc-600">
            <Loader2 className="size-4 animate-spin shrink-0" />
            Waiting for your wallet to confirm…
          </div>
        )}
        {walletConnected && isWrongChain && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 ring-1 ring-red-200 px-3 py-2.5 text-[13px] text-red-600">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>Wrong network. Switch your wallet to the configured Clearance402 network to continue.</span>
          </div>
        )}

        {/* Primary action — close dialog before RainbowKit opens */}
        <div className="mt-1">
          <ConnectButton.Custom>
            {({ openConnectModal, openChainModal, account, chain, mounted }) => {
              const ready = mounted;
              if (ready && account && chain?.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={() => openWalletModal(openChainModal)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-red-600 text-white px-4 py-3 text-[14px] font-medium hover:bg-red-700"
                  >
                    <AlertTriangle className="size-4" /> Switch network
                  </button>
                );
              }
              if (ready && account) {
                return (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      navigate({ to: redirect });
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#4f46e5] text-white px-4 py-3 text-[14px] font-medium hover:bg-[#4338ca]"
                  >
                    <CheckCircle2 className="size-4" /> Open the console
                    <ArrowRight className="size-4" />
                  </button>
                );
              }
              return (
                <button
                  type="button"
                  onClick={() => openWalletModal(openConnectModal)}
                  disabled={!ready}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 text-white px-4 py-3 text-[14px] font-medium hover:bg-zinc-800",
                    !ready && "opacity-60",
                  )}
                >
                  <Wallet className="size-4" /> Connect wallet
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Web2 helper */}
        <div className="rounded-xl bg-zinc-50 ring-1 ring-zinc-200 p-3.5 text-[12.5px] text-zinc-600 leading-relaxed">
          <p className="font-medium text-zinc-900 mb-1">First time here?</p>
          Install a browser wallet like MetaMask, then connect above. You can also{" "}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              navigate({ to: "/docs" });
            }}
            className="text-[#4f46e5] font-medium hover:underline"
          >
            read the get-started guide
          </button>{" "}
          first.
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Convenience hook for opening the connect dialog from anywhere. */
export function useConnectDialog() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
