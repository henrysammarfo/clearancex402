import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  getOrCreateSessionSmartAccount,
  parseGrantedPermission,
  requestAgentSpendPermission,
} from "@/lib/clearance/metamask-permissions";
import { getAgentSessionPrivateKey } from "@/lib/clearance/agent-session";
import { clearanceApi } from "@/lib/clearance/clearance-api";
import {
  useClearancePermissions,
  useClearanceWallet,
  useInvalidateClearanceAccount,
} from "@/lib/clearance/use-clearance-account";
import { defaultAllowedDomains } from "@/lib/clearance/permission-domains";

export const Route = createFileRoute("/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions · Clearance402" },
      {
        name: "description",
        content: "MetaMask Advanced Permissions (ERC-7715): spend cap, allowed domains, expiry, revoke.",
      },
    ],
  }),
  component: Page,
});

type Grant = {
  id: string;
  agentId: string;
  maxPerCallUsd: number;
  dailyLimitUsd: number;
  allowedDomains: string[];
  expiresAt: string;
  spentUsd: number;
  revokedAt?: string;
  permissionContext?: string;
  delegationManager?: string;
  sessionSmartAccount?: string;
  redelegatedContext?: string;
};

function Page() {
  const { wallet, isConnected } = useClearanceWallet();
  const { data: permData, refetch } = useClearancePermissions(wallet);
  const invalidate = useInvalidateClearanceAccount();
  const grants = permData ?? [];
  const [agentId, setAgentId] = useState("buyer-agent");
  const [cap, setCap] = useState("5.00");
  const [domains, setDomains] = useState(defaultAllowedDomains);
  const [expiryHours, setExpiryHours] = useState("24");
  const [sessionAccount, setSessionAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grant = async () => {
    if (!wallet || !isConnected) {
      setError("Connect MetaMask on Base Sepolia first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const maxPerCallUsd = parseFloat(cap);
      const expiry = parseInt(expiryHours, 10);
      const domainList = domains.split(",").map((d) => d.trim()).filter(Boolean);

      const { smartAccount } = await getOrCreateSessionSmartAccount();
      setSessionAccount(smartAccount.address);

      const granted = await requestAgentSpendPermission({
        maxUsd: maxPerCallUsd,
        expirySeconds: expiry * 3600,
      });
      const parsed = parseGrantedPermission(granted);

      const res = await clearanceApi.savePermission(wallet, {
          userWallet: wallet,
          agentId,
          maxPerCallUsd,
          dailyLimitUsd: maxPerCallUsd * 10,
          allowedDomains: domainList,
          expiryHours: expiry,
          permissionContext: parsed.permissionContext,
          delegationManager: parsed.delegationManager,
          sessionSmartAccount: smartAccount.address,
          grantedPayload: parsed.grantedPayload,
        });

      const privateKey = getAgentSessionPrivateKey();
      if (privateKey) {
        await clearanceApi.session(wallet, {
          userWallet: wallet,
          agentId,
          smartAccount: smartAccount.address,
          privateKey,
        });
      }

      invalidate(wallet);
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (id: string) => {
    if (!wallet) return;
    await clearanceApi.revokePermission(wallet, id);
    invalidate(wallet);
    await refetch();
  };

  return (
    <ConsoleShell
      section="Permissions"
      title="Agent permissions"
      description="Grant ERC-7715 execution permissions via MetaMask Smart Accounts Kit. Session smart account pays x402 after clearance."
    >
      {error && <p className="text-sm text-chain-failed mb-4">{error}</p>}

      {sessionAccount && (
        <p className="text-xs text-muted-foreground mb-4 font-mono">
          Session smart account: {sessionAccount}
        </p>
      )}

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Grant ERC-7715 permission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Agent ID</Label>
              <Input value={agentId} onChange={(e) => setAgentId(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">USDC allowance cap</Label>
                <Input value={cap} onChange={(e) => setCap(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Expiry (hours)</Label>
                <Input value={expiryHours} onChange={(e) => setExpiryHours(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Allowed domains (Clearance402 policy)</Label>
              <Input value={domains} onChange={(e) => setDomains(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Include <strong className="text-foreground">clearancex402.vercel.app</strong> (or your app host) for the
              built-in x402 demo. MetaMask will prompt for{" "}
              <code className="text-[11px]">wallet_requestExecutionPermissions</code> — USDC allowance on Base Sepolia for
              the session smart account.
            </p>
            <Button className="w-full" onClick={grant} disabled={loading || !isConnected}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" /> Awaiting MetaMask…
                </>
              ) : (
                "Grant via Smart Accounts Kit"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grants.filter((g) => !g.revokedAt).length === 0 && (
              <p className="text-sm text-muted-foreground">No active permissions.</p>
            )}
            {grants
              .filter((g) => !g.revokedAt)
              .map((g) => (
                <div key={g.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-medium">{g.agentId}</p>
                    <Button size="sm" variant="outline" onClick={() => revoke(g.id)}>
                      Revoke
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <Meta label="Cap" value={`$${g.maxPerCallUsd.toFixed(2)}`} />
                    <Meta label="Spent" value={`$${g.spentUsd.toFixed(2)}`} />
                    <Meta label="Domains" value={g.allowedDomains.join(", ")} />
                    <Meta label="Expires" value={new Date(g.expiresAt).toLocaleString()} />
                  </div>
                  {g.permissionContext && (
                    <p className="text-[10px] text-muted-foreground mt-2 font-mono truncate">
                      ERC-7715 {g.permissionContext.slice(0, 18)}…
                      {g.redelegatedContext ? " · redelegated" : ""}
                    </p>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground uppercase tracking-wide text-[10px]">{label}</p>
      <p className="font-medium truncate">{value}</p>
    </div>
  );
}
