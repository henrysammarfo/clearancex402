import { KeyRound } from "lucide-react";
import { useConnection } from "@/lib/connection";
import { cn } from "@/lib/utils";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Sidebar / compact wallet + network status (reads wagmi via ConnectionProvider). */
export function ConnectionFooter({ className }: { className?: string }) {
  const { status, isConnected, walletAddress, isWrongChain } = useConnection();

  let label = "Not connected · Story testnet";
  if (status === "connecting") label = "Connecting…";
  else if (isWrongChain) label = "Wrong network · switch to Aeneid";
  else if (isConnected && walletAddress) label = `${shortAddress(walletAddress)} · Aeneid`;
  else if (status === "failed") label = "Connection failed · check network";

  return (
    <div className={cn("px-2 py-2 text-[11px] text-muted-foreground flex items-center gap-1.5 min-w-0", className)}>
      <KeyRound className="size-3 shrink-0" />
      <span className="truncate" title={walletAddress ?? undefined}>
        {label}
      </span>
      {isConnected && <span className="size-1.5 rounded-full bg-chain-success shrink-0" aria-hidden />}
    </div>
  );
}
