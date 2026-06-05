import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { useConnection } from "@/lib/connection";

/** Wallet connect / disconnect for product dashboards (switch Publisher ↔ Buyer). */
export function DashboardWalletActions() {
  const { isConnected, walletAddress } = useConnection();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-xs font-mono text-muted-foreground max-w-[140px] truncate">
        {walletAddress}
      </span>
      <Button type="button" variant="outline" size="sm" onClick={() => disconnect()}>
        Disconnect
      </Button>
    </div>
  );
}
