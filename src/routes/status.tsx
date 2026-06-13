import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ConsoleShell } from "@/components/layout/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Status · Clearance402" },
      { name: "description", content: "Live health of Clearance402 APIs, chain, and integrations." },
    ],
  }),
  component: Page,
});

type StatusResponse = {
  ok: boolean;
  chainId: number;
  network: string;
  x402Network: string;
  probeWalletConfigured: boolean;
  veniceConfigured: boolean;
};

function Page() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clearance/status");
      setStatus((await res.json()) as StatusResponse);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ConsoleShell
      section="Status"
      title="Platform status"
      description="Live configuration checks for Base Sepolia x402 probes and Venice eval."
      actions={
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Refresh"}
        </Button>
      }
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-sm">Runtime</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {loading && <p className="text-muted-foreground">Checking…</p>}
          {status && (
            <>
              <Row label="API" value={status.ok ? "OK" : "Degraded"} ok={status.ok} />
              <Row label="Chain" value={`${status.network} (${status.chainId})`} ok />
              <Row label="x402 network" value={status.x402Network} ok />
              <Row
                label="Probe wallet"
                value={status.probeWalletConfigured ? "Configured" : "Missing WALLET_PRIVATE_KEY"}
                ok={status.probeWalletConfigured}
              />
              <Row
                label="Venice API"
                value={status.veniceConfigured ? "Configured" : "Missing VENICE_API_KEY"}
                ok={status.veniceConfigured}
              />
            </>
          )}
          <p className="text-xs text-muted-foreground pt-2">
            Agent payments use the browser session account after ERC-7715 grant on{" "}
            <Link to="/permissions" className="underline">Permissions</Link>.
          </p>
        </CardContent>
      </Card>
    </ConsoleShell>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={ok === false ? "text-chain-failed font-medium" : "font-medium"}>{value}</span>
    </div>
  );
}
