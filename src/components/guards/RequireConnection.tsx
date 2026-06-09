import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { UnauthorizedState } from "@/components/states";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { useConnection } from "@/lib/connection";

export function RequireConnection({ children, reason }: { children: React.ReactNode; reason?: string }) {
  const { isConnected, config, isWrongChain } = useConnection();

  if (isConnected) return <>{children}</>;

  const description = isWrongChain
    ? "Switch your wallet to the configured Clearance402 network, then retry."
    : config
      ? "Connect a wallet to run Clearance402 operator workflows."
      : "Configure Clearance402 endpoints in Settings, then connect a wallet.";

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
