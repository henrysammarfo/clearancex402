import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/states";
import { getClientEnv } from "@/lib/env/client";
import { probeStoryRpc } from "@/lib/network/health";
import { useConnection } from "@/lib/connection";

export const Route = createFileRoute("/status")({
  head: () => ({ meta: [{ title: "Cipherline · Status" }] }),
  component: StatusPage,
});

function StatusPage() {
  const env = getClientEnv();
  const { config, isConnected, walletAddress, isWrongChain } = useConnection();
  const rpcUrl = config?.rpcUrl ?? env.storyRpcUrl;
  const apiUrl = config?.cdrUrl ?? env.storyApiUrl;

  const rpc = useQuery({
    queryKey: ["health", "rpc", rpcUrl],
    queryFn: () => probeStoryRpc(rpcUrl),
    refetchInterval: 30_000,
  });

  const storyApi = useQuery({
    queryKey: ["health", "story-api"],
    queryFn: async () => {
      const res = await fetch("/api/story-api/status");
      const json = (await res.json()) as {
        ok?: boolean;
        latencyMs?: number;
        error?: string;
        apiUrl?: string;
      };
      return {
        ok: Boolean(json.ok),
        latencyMs: json.latencyMs,
        error: json.error,
        apiUrl: json.apiUrl ?? apiUrl,
      };
    },
    refetchInterval: 30_000,
  });

  const registry = useQuery({
    queryKey: ["health", "registry"],
    queryFn: async () => {
      const res = await fetch("/api/registry/status");
      const json = (await res.json()) as { available?: boolean };
      return { ok: res.ok && json.available === true };
    },
    refetchInterval: 30_000,
  });

  const ipfs = useQuery({
    queryKey: ["health", "ipfs"],
    queryFn: async () => {
      const res = await fetch("/api/ipfs/status");
      return { ok: res.ok };
    },
    refetchInterval: 30_000,
  });

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[900px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl font-medium tracking-tight">Status</h1>
        <p className="text-zinc-600 mt-2">Live probes against Story Aeneid RPC and Story-API REST (CDR DKG).</p>
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <HealthCard
            title="Story Aeneid RPC"
            subtitle={rpcUrl}
            loading={rpc.isLoading}
            ok={rpc.data?.ok}
            detail={
              rpc.data?.ok
                ? `Block ${rpc.data.blockNumber} · ${rpc.data.latencyMs}ms`
                : rpc.data?.error ?? rpc.error?.message
            }
          />
          <HealthCard
            title="Story-API REST (CDR)"
            subtitle={apiUrl}
            loading={storyApi.isLoading}
            ok={storyApi.data?.ok}
            detail={
              storyApi.data?.ok
                ? `Reachable · ${storyApi.data.latencyMs}ms`
                : storyApi.data?.error ?? storyApi.error?.message
            }
          />
          <HealthCard
            title="Wallet"
            subtitle="RainbowKit · WalletConnect"
            loading={false}
            ok={isConnected && !isWrongChain}
            detail={
              isConnected
                ? isWrongChain
                  ? "Connected — switch to Story Aeneid (1315)"
                  : walletAddress ?? "Connected"
                : "Not connected — use header Connect wallet"
            }
          />
          <HealthCard
            title="Registry API"
            subtitle="VPS · shared with app"
            loading={registry.isLoading}
            ok={registry.data?.ok}
            detail={registry.data?.ok ? "available: true" : registry.error?.message ?? "unavailable"}
          />
          <HealthCard
            title="IPFS proxy"
            subtitle="VPS · encrypted uploads"
            loading={ipfs.isLoading}
            ok={ipfs.data?.ok}
            detail={ipfs.data?.ok ? "Reachable" : ipfs.error?.message ?? "unavailable"}
          />
          <HealthCard
            title="MCP server"
            subtitle="@line-stack/mcp-server"
            loading={false}
            ok={undefined}
            detail="Run locally: npm run linestack:mcp — tools mirror SDK"
          />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function HealthCard({
  title,
  subtitle,
  loading,
  ok,
  detail,
}: {
  title: string;
  subtitle: string;
  loading: boolean;
  ok?: boolean;
  detail?: string;
}) {
  const chip =
    loading ? "running" : ok === true ? "success" : ok === false ? "failed" : "idle";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground break-all">{detail ?? "—"}</span>
        <StatusChip status={chip} />
      </CardContent>
    </Card>
  );
}
