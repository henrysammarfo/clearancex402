import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { UnauthorizedState } from "@/components/states";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { useConnection } from "@/lib/connection";

export function RequireConnection({ children, reason }: { children: React.ReactNode; reason?: string }) {
  const { isConnected, config, isWrongChain } = useConnection();

  if (isConnected) return <>{children}</>;

  const description = isWrongChain
    ? "Switch your wallet to Story Aeneid Testnet (chain ID 1315), then retry."
    : config
      ? "Connect a wallet on Story Aeneid to use CDR vault and query flows."
      : "Configure Story RPC and Story-API URLs in Settings, then connect a wallet.";

  return (
    <UnauthorizedState
      title={isWrongChain ? "Wrong network" : "Wallet required"}
      reason={reason ?? description}
      action={
        <div className="flex flex-wrap items-center justify-center gap-2">
          <WalletConnect />
          <Button asChild size="sm" variant="outline">
            <Link to="/settings">Settings</Link>
          </Button>
        </div>
      }
    />
  );
}
