import { createFileRoute } from "@tanstack/react-router";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/relayer")({
  head: () => ({
    meta: [
      { title: "Relayer · Clearance402" },
      { name: "description", content: "Gas abstraction note for testnet build." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ConsoleShell
      section="Relayer"
      title="Relayer (testnet note)"
      description="This submission targets Base Sepolia only. The 1Shot mainnet relayer prize requires mainnet 7710 relay."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Why no live relayer here</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            Clearance402 x402 payments run via <code>@x402/fetch</code> on Base Sepolia using the
            x402.org testnet facilitator. The HackQuest 1Shot track requires the permissionless{" "}
            <strong>mainnet</strong> relayer and 7702 upgrades — excluded from this testnet build.
          </p>
          <p>
            Primary cook-off tracks covered: x402 + ERC-7710, Agent, A2A, Venice AI — with MetaMask
            permissions, live probes, and audit evidence on /payment-lab and /audit.
          </p>
        </CardContent>
      </Card>
    </ConsoleShell>
  );
}
