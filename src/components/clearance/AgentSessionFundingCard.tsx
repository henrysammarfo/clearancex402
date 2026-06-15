import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine, Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import type { Address } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchSessionBalances,
  formatSessionBalances,
  withdrawSessionUsdc,
} from "@/lib/clearance/agent-session-balances";
import { getAgentSessionPrivateKey } from "@/lib/clearance/agent-session";
import { useClearanceAccount, useClearanceWallet } from "@/lib/clearance/use-clearance-account";
import { toast } from "sonner";

type SessionRow = {
  agentId: string;
  buyerEoa?: string;
  smartAccount: string;
};

export function AgentSessionFundingCard({ permissionsAgentIds }: { permissionsAgentIds: string[] }) {
  const { wallet, isConnected } = useClearanceWallet();
  const { data: account } = useClearanceAccount(wallet);
  const qc = useQueryClient();

  const sessions = useMemo((): SessionRow[] => {
    const fromServer = account?.agentSessions ?? [];
    const byAgent = new Map<string, SessionRow>();
    for (const s of fromServer) {
      byAgent.set(s.agentId, {
        agentId: s.agentId,
        buyerEoa: s.buyerEoa,
        smartAccount: s.smartAccount,
      });
    }
    for (const p of account?.permissions ?? []) {
      if (!byAgent.has(p.agentId) && p.sessionSmartAccount) {
        byAgent.set(p.agentId, {
          agentId: p.agentId,
          smartAccount: p.sessionSmartAccount,
        });
      }
    }
    for (const id of permissionsAgentIds) {
      if (!byAgent.has(id)) byAgent.set(id, { agentId: id, smartAccount: "—" });
    }
    return [...byAgent.values()];
  }, [account, permissionsAgentIds]);

  const [agentId, setAgentId] = useState("buyer-agent");
  const active = sessions.find((s) => s.agentId === agentId) ?? sessions[0];
  const buyerEoa = active?.buyerEoa as Address | undefined;

  const [withdrawAmount, setWithdrawAmount] = useState("0.50");
  const [withdrawing, setWithdrawing] = useState(false);

  const { data: balances, isFetching, refetch } = useQuery({
    queryKey: ["session-balances", buyerEoa],
    queryFn: () => fetchSessionBalances(buyerEoa!),
    enabled: Boolean(buyerEoa),
    refetchInterval: 15_000,
  });

  const formatted = balances ? formatSessionBalances(balances) : null;
  const canWithdraw = Boolean(getAgentSessionPrivateKey() && buyerEoa && wallet);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const onWithdraw = async () => {
    const pk = getAgentSessionPrivateKey();
    if (!pk || !wallet || !buyerEoa) {
      toast.error("Withdraw needs an active browser session — re-grant permission on this page first.");
      return;
    }
    setWithdrawing(true);
    try {
      const amount = parseFloat(withdrawAmount);
      const hash = await withdrawSessionUsdc({
        buyerPrivateKey: pk,
        to: wallet as Address,
        amountUsdc: amount,
      });
      toast.success("Withdraw submitted", {
        description: hash.slice(0, 18) + "…",
      });
      await refetch();
      if (wallet) void qc.invalidateQueries({ queryKey: ["clearance", "account", wallet] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setWithdrawing(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Agent wallet — deposit &amp; withdraw</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect MetaMask to view and fund the agent session buyer wallet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm">Agent wallet — deposit &amp; withdraw</CardTitle>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Your MetaMask wallet is the <strong className="text-foreground">operator</strong> (account ID).
            The <strong className="text-foreground">session buyer EOA</strong> below pays x402 after clearance — fund it
            with Base Sepolia ETH (gas) and USDC.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={!buyerEoa || isFetching}>
          <RefreshCw className={`size-3.5 mr-1 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {sessions.length > 1 && (
          <div className="space-y-1.5 max-w-xs">
            <Label className="text-xs text-muted-foreground">Agent</Label>
            <select
              value={active?.agentId ?? agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              {sessions.map((s) => (
                <option key={s.agentId} value={s.agentId}>
                  {s.agentId}
                </option>
              ))}
            </select>
          </div>
        )}

        {!buyerEoa ? (
          <p className="text-sm text-muted-foreground">
            Grant permission above first — we will show the session buyer address to fund.
          </p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <AddressBlock
                label="Session buyer EOA (fund this for x402 pay)"
                address={buyerEoa}
                onCopy={() => copy(buyerEoa, "Buyer EOA")}
              />
              {active?.smartAccount && active.smartAccount !== "—" && (
                <AddressBlock
                  label="Session smart account (ERC-7715 mandate)"
                  address={active.smartAccount}
                  onCopy={() => copy(active.smartAccount, "Smart account")}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <BalancePill label="ETH" value={formatted?.eth ?? "—"} sub="gas" />
              <BalancePill label="USDC" value={formatted?.usdc ?? "—"} sub="x402 spend" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ArrowDownToLine className="size-4 text-brand" />
                  Deposit
                </div>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal pl-4">
                  <li>Copy the <strong className="text-foreground">session buyer EOA</strong> above.</li>
                  <li>In MetaMask (Base Sepolia), send <strong className="text-foreground">USDC</strong> + a little <strong className="text-foreground">ETH</strong> to that address.</li>
                  <li>~$0.01 USDC per x402 demo call; keep ~0.001 ETH for gas.</li>
                </ol>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://www.alchemy.com/faucets/base-sepolia" target="_blank" rel="noreferrer">
                      ETH faucet <ExternalLink className="size-3 ml-1" />
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href="https://faucet.circle.com/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      USDC faucet <ExternalLink className="size-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ArrowUpFromLine className="size-4 text-brand" />
                  Withdraw USDC
                </div>
                <p className="text-xs text-muted-foreground">
                  Send USDC from the session buyer back to your connected MetaMask wallet.
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Amount (USDC)</Label>
                  <Input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={onWithdraw}
                  disabled={withdrawing || !canWithdraw}
                >
                  {withdrawing ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1" /> Withdrawing…
                    </>
                  ) : (
                    "Withdraw to my wallet"
                  )}
                </Button>
                {!canWithdraw && (
                  <p className="text-[11px] text-muted-foreground">
                    Re-grant permission on this page (same tab, no refresh) to enable withdraw. Deposit only needs the
                    address above.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AddressBlock({
  label,
  address,
  onCopy,
}: {
  label: string;
  address: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xs font-mono break-all">{address}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onCopy}>
          <Copy className="size-3 mr-1" /> Copy
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <a href={`https://sepolia.basescan.org/address/${address}`} target="_blank" rel="noreferrer">
            Explorer <ExternalLink className="size-3 ml-1" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function BalancePill({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border px-4 py-2 min-w-[120px]">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}
