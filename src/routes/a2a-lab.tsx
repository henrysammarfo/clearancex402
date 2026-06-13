import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Wallet, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { openRedelegatePermission } from "@/lib/clearance/metamask-permissions";
import { clearanceApi } from "@/lib/clearance/clearance-api";
import { useClearanceWallet, useInvalidateClearanceAccount } from "@/lib/clearance/use-clearance-account";
import { ConnectWalletPrompt } from "@/components/clearance/ConnectWalletPrompt";
import type { Hex } from "viem";

export const Route = createFileRoute("/a2a-lab")({
  head: () => ({
    meta: [
      { title: "A2A lab · Clearance402" },
      { name: "description", content: "Scout → Verifier → Guardian → Buyer with redelegation." },
    ],
  }),
  component: Page,
});

const AGENTS = [
  { name: "Scout Agent", icon: Search, role: "Discovers candidate paid tools.", accent: "text-query" },
  { name: "Buyer Agent", icon: Wallet, role: "Pays once cleared within mandate.", accent: "text-brand" },
  { name: "Verifier Agent", icon: ShieldCheck, role: "Probes + Venice output eval.", accent: "text-chain-success" },
  { name: "Guardian Agent", icon: ShieldAlert, role: "Blocks or allows based on risk.", accent: "text-chain-failed" },
];

type TraceStep = { step: number; agent: string; message: string };

type A2AResponse = {
  trace?: TraceStep[];
  decision?: { state: string };
  permission?: { id: string; permissionContext?: string; redelegatedContext?: string };
  tool?: { id: string; endpoint: string; name: string };
  amountUsd?: number;
  error?: string;
};

function Page() {
  const { wallet, isConnected } = useClearanceWallet();
  const invalidate = useInvalidateClearanceAccount();
  const [loading, setLoading] = useState(false);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [decision, setDecision] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<A2AResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!wallet) return;
    setLoading(true);
    setTrace([]);
    setDecision(null);
    setError(null);
    try {
      const data = (await clearanceApi.a2a(wallet!, {
          query: "vision",
          toolId: "venice-vision",
          buyerAgentId: "buyer-agent",
          parentAgentId: "guardian-agent",
          userWallet: wallet,
        })) as A2AResponse;
      setLastRun(data);
      if (data.trace) setTrace(data.trace);
      if (data.decision) setDecision(data.decision.state);
      if (data.error) setError(data.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const redelegateAndPay = async () => {
    if (!lastRun?.permission?.permissionContext || !lastRun.tool) {
      setError("Grant ERC-7715 permission on /permissions first.");
      return;
    }
    if (!isConnected) {
      setError("Connect MetaMask for ERC-7710 redelegation.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const redelegated = await openRedelegatePermission({
        permissionContext: lastRun.permission.permissionContext as Hex,
      });

      await clearanceApi.patchPermission(wallet!, {
        id: lastRun.permission.id,
        redelegatedContext: redelegated.permissionContext,
      });

      setTrace((t) => [
        ...t,
        {
          step: t.length + 1,
          agent: "Guardian",
          message: `ERC-7710 redelegated · context ${redelegated.permissionContext.slice(0, 14)}…`,
        },
      ]);

      if (lastRun.decision?.state === "ALLOW" || lastRun.decision?.state === "WARN") {
        await clearanceApi.pay(wallet!, {
          agentId: "buyer-agent",
          toolId: lastRun.tool.id,
          userWallet: wallet,
          execute: true,
          permissionId: lastRun.permission.id,
        });
        invalidate(wallet!);
        setTrace((t) => [
          ...t,
          {
            step: t.length + 1,
            agent: "Buyer",
            message: `Paid $${(lastRun.amountUsd ?? 0).toFixed(3)} USDC · server x402 executed`,
          },
        ]);
        setDecision("ALLOW · PAID");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConsoleShell
      section="A2A lab"
      title="Agent-to-agent coordination"
      description="Server scouts + verifies + guards; browser redelegates (ERC-7710) and pays via session x402 buyer."
      actions={
        <div className="flex gap-2">
          <Button onClick={run} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1" /> Running…
              </>
            ) : (
              "Run server flow"
            )}
          </Button>
          {lastRun?.permission && (
            <Button variant="outline" onClick={redelegateAndPay} disabled={loading || !isConnected}>
              Redelegate + pay
            </Button>
          )}
        </div>
      }
    >
      {error && <p className="text-sm text-chain-failed mb-4">{error}</p>}

      <div className="flex flex-col lg:flex-row items-stretch gap-3 mb-8">
        {AGENTS.map((a, i) => (
          <div key={a.name} className="flex items-center gap-3 flex-1">
            <Card className="flex-1">
              <CardContent className="p-5">
                <a.icon className={`size-6 mb-3 ${a.accent}`} />
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.role}</p>
              </CardContent>
            </Card>
            {i < AGENTS.length - 1 && (
              <ArrowRight className="size-5 text-muted-foreground shrink-0 hidden lg:block" />
            )}
          </div>
        ))}
      </div>

      {decision && (
        <p className="text-sm mb-4">
          Final clearance: <strong>{decision}</strong>
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Coordination trace</CardTitle>
        </CardHeader>
        <CardContent>
          {trace.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">
              Run the server flow, then redelegate + pay from MetaMask (requires /permissions grant + funded session account).
            </p>
          )}
          <ol className="space-y-3 text-sm">
            {trace.map((t, i) => (
              <li key={`${t.step}-${i}`} className="flex gap-3">
                <span className="size-6 shrink-0 rounded-full bg-muted text-xs font-semibold flex items-center justify-center">
                  {t.step}
                </span>
                <span>
                  <span className="font-medium">{t.agent}</span> ·{" "}
                  <span className="text-muted-foreground">{t.message}</span>
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </ConsoleShell>
  );
}
