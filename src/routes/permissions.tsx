import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConsoleShell, PreviewNote } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions · Clearance402" },
      { name: "description", content: "MetaMask Advanced Permissions: spend limit, allowed domains, expiry, and revoke." },
    ],
  }),
  component: Page,
});

type Grant = { id: string; agent: string; cap: string; spent: string; domains: string; expiry: string };

const INITIAL: Grant[] = [
  { id: "g1", agent: "buyer-agent", cap: "$5.00 USDC", spent: "$0.42", domains: "venice.ai, lingua.dev", expiry: "in 23h" },
  { id: "g2", agent: "scout-agent", cap: "$1.00 USDC", spent: "$0.00", domains: "*.bazaar.x402", expiry: "in 6h" },
];

function Page() {
  const [grants, setGrants] = useState<Grant[]>(INITIAL);

  return (
    <ConsoleShell
      section="Permissions"
      title="Agent permissions"
      description="Grant a Buyer Agent limited spend with MetaMask Advanced Permissions (ERC-7715). Clearance402 checks tools are safe before permissions are redeemed."
    >
      <PreviewNote>Permission creation and revocation here are preview-only. Real ERC-7715 grants are signed through MetaMask Smart Accounts in the implementation phase.</PreviewNote>

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Grant permission</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Agent ID</Label><Input placeholder="buyer-agent" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Spend cap (USDC)</Label><Input placeholder="5.00" /></div>
              <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Expiry (hours)</Label><Input placeholder="24" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Allowed domains</Label><Input placeholder="venice.ai, lingua.dev" /></div>
            <Button className="w-full">Grant via MetaMask</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Active permissions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {grants.length === 0 && <p className="text-sm text-muted-foreground">No active permissions.</p>}
            {grants.map((g) => (
              <div key={g.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="font-medium">{g.agent}</p>
                  <Button size="sm" variant="outline" onClick={() => setGrants((p) => p.filter((x) => x.id !== g.id))}>
                    Revoke
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <Meta label="Cap" value={g.cap} />
                  <Meta label="Spent" value={g.spent} />
                  <Meta label="Domains" value={g.domains} />
                  <Meta label="Expiry" value={g.expiry} />
                </div>
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
      <p className="font-medium">{value}</p>
    </div>
  );
}
