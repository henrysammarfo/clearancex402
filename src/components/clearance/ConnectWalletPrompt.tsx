import { Card, CardContent } from "@/components/ui/card";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectWalletPrompt() {
  return (
    <Card className="max-w-md">
      <CardContent className="pt-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect MetaMask on Base Sepolia. Your account data is stored server-side — same wallet, any device.
        </p>
        <ConnectButton />
      </CardContent>
    </Card>
  );
}
