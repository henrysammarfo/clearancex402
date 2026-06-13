import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Plug, ShieldAlert } from "lucide-react";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useConnection,
  DEFAULT_EXPLORER_BASE_URL,
  BASE_SEPOLIA_DEFAULT_CONFIG,
  type Environment,
  type Network,
} from "@/lib/connection";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Lock, ShieldCheck } from "lucide-react";
import { UnauthorizedState } from "@/components/states";

const schema = z.object({
  rpcUrl: z.string().url("Must be a valid URL"),
  explorerBaseUrl: z.string().url("Must be a valid URL"),
  network: z.enum(["base-sepolia"]),
  environment: z.enum(["development", "staging", "production"]),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Clearance402 · Settings" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { config, status, isConnected, isWrongChain, walletAddress, save, clear } = useConnection();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rpcUrl: config?.rpcUrl ?? BASE_SEPOLIA_DEFAULT_CONFIG.rpcUrl,
      explorerBaseUrl: config?.explorerBaseUrl ?? DEFAULT_EXPLORER_BASE_URL,
      network: (config?.network as Network) ?? "base-sepolia",
      environment: (config?.environment as Environment) ?? "development",
    },
    values: config
      ? {
          rpcUrl: config.rpcUrl,
          explorerBaseUrl: config.explorerBaseUrl ?? DEFAULT_EXPLORER_BASE_URL,
          network: config.network,
          environment: config.environment,
        }
      : undefined,
  });

  const onSubmit = form.handleSubmit((vals) => save(vals));

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[820px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl font-medium tracking-tight">Settings</h1>
        <p className="text-zinc-600 mt-2">
          Network defaults from environment variables. Overrides apply for this browser session only (not saved to localStorage).
        </p>

        <StatusCard
          status={
            isConnected
              ? "connected"
              : isWrongChain
                ? "failed"
                : walletAddress
                  ? "configured"
                  : config
                    ? "configured"
                    : "disconnected"
          }
          walletAddress={walletAddress}
          isWrongChain={isWrongChain}
        />

        <SecurityAccessCard
          isConnected={isConnected}
          isWrongChain={isWrongChain}
          walletAddress={walletAddress}
          hasConfig={!!config}
        />


        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <div className="rounded-2xl border bg-white p-6 space-y-4">
            <h3 className="font-semibold">Network endpoints</h3>
            <div className="space-y-2">
              <Label htmlFor="rpcUrl">Base Sepolia RPC URL</Label>
              <Input id="rpcUrl" placeholder={BASE_SEPOLIA_DEFAULT_CONFIG.rpcUrl} {...form.register("rpcUrl")} />
              {form.formState.errors.rpcUrl && <p className="text-xs text-chain-failed">{form.formState.errors.rpcUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="explorerBaseUrl">Tx explorer base URL</Label>
              <Input id="explorerBaseUrl" placeholder={DEFAULT_EXPLORER_BASE_URL} {...form.register("explorerBaseUrl")} />
              <p className="text-xs text-muted-foreground">Used for “Open tx details” links in audit tables. Tx hash is appended to this URL.</p>
              {form.formState.errors.explorerBaseUrl && <p className="text-xs text-chain-failed">{form.formState.errors.explorerBaseUrl.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Network</Label>
                <Select value={form.watch("network")} onValueChange={(v) => form.setValue("network", v as Network, { shouldDirty: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base-sepolia">Base Sepolia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select value={form.watch("environment")} onValueChange={(v) => form.setValue("environment", v as Environment, { shouldDirty: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">development</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                    <SelectItem value="production">production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 space-y-4">
            <h3 className="font-semibold">Secrets &amp; API keys</h3>
            <p className="text-sm text-muted-foreground">
              All secrets live in <code className="text-xs">.env.local</code> (local) or your host env (Vercel). Never in the browser.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li><code>VENICE_API_KEY</code> — server Venice eval</li>
              <li><code>WALLET_PRIVATE_KEY</code> — server x402 probes</li>
              <li><code>VITE_WALLETCONNECT_PROJECT_ID</code> — WalletConnect</li>
              <li><code>CLEARANCE402_API_URL</code> — SDK / CLI / MCP</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              See <Link to="/status" className="underline">Status</Link> for live configuration checks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!form.formState.isDirty}>Save session override</Button>
            <Button type="button" variant="outline" onClick={() => { clear(); form.reset({ rpcUrl: BASE_SEPOLIA_DEFAULT_CONFIG.rpcUrl, explorerBaseUrl: DEFAULT_EXPLORER_BASE_URL, network: "base-sepolia", environment: "development" }); }}>
              Reset to env defaults
            </Button>
            <p className="text-xs text-zinc-500">
              Connect wallet in the header for operator pages.
            </p>
          </div>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

function SecurityAccessCard({
  isConnected,
  isWrongChain,
  walletAddress,
  hasConfig,
}: {
  isConnected: boolean;
  isWrongChain: boolean;
  walletAddress: string | null;
  hasConfig: boolean;
}) {
  const level = isConnected ? "Operator" : "Read-only";
  const checks: { label: string; ok: boolean; note: string }[] = [
    {
      label: "Wallet authenticated",
      ok: isConnected,
      note: isConnected ? `Signed in as ${walletAddress}` : "No wallet connected — sensitive actions are blocked.",
    },
    {
      label: "Correct network",
      ok: isConnected && !isWrongChain,
      note: isWrongChain ? "Wallet is on the wrong chain." : isConnected ? "Network verified." : "Connect a wallet to verify.",
    },
    {
      label: "Endpoints configured",
      ok: hasConfig,
      note: hasConfig ? "Network + verification endpoints saved in this browser." : "Save endpoints below to enable clearance flows.",
    },
  ];

  return (
    <div className="mt-6 rounded-2xl border bg-white p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-brand" />
          <h3 className="font-semibold">Security &amp; access</h3>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
            isConnected
              ? "border-chain-success/40 bg-chain-success/10 text-foreground"
              : "border-chain-unauthorized/40 bg-chain-unauthorized/10 text-foreground",
          )}
        >
          <Lock className="size-3" />
          {level} access
        </span>
      </div>

      {!isConnected && (
        <UnauthorizedState
          title="You are not authorized for operator actions"
          reason="Connect a wallet to manage API keys, run clearance checks, and access the audit log. Read-only previews remain available."
          action={
            <Button size="sm" asChild>
              <Link to="/login" search={{ redirect: "/settings" }}>Connect wallet</Link>
            </Button>
          }
        />
      )}

      <ul className="space-y-2">
        {checks.map((c) => (
          <li key={c.label} className="flex items-start gap-3 rounded-lg border p-3">
            <span
              className={cn(
                "mt-0.5 size-2 rounded-full shrink-0",
                c.ok ? "bg-chain-success" : "bg-chain-unauthorized",
              )}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}



function StatusCard({
  status,
  walletAddress,
  isWrongChain,
}: {
  status: "connected" | "configured" | "disconnected" | "failed";
  walletAddress: string | null;
  isWrongChain: boolean;
}) {
  const map = {
    connected: {
      icon: <CheckCircle2 className="size-5" />,
      title: "Connected",
      text: `Authorized wallet · ${walletAddress ?? ""}`,
      cls: "border-chain-success/40 bg-chain-success/10",
    },
    configured: {
      icon: <Plug className="size-5" />,
      title: "Configured · awaiting wallet",
      text: "Endpoints saved. Connect wallet in the header to continue.",
      cls: "border-chain-unauthorized/40 bg-chain-unauthorized/10",
    },
    disconnected: {
      icon: <Plug className="size-5" />,
      title: "Disconnected",
      text: "Save endpoints below and connect a wallet to enable clearance flows.",
      cls: "border-border bg-muted/40",
    },
    failed: {
      icon: <ShieldAlert className="size-5" />,
      title: isWrongChain ? "Wrong network" : "Connection failed",
      text: isWrongChain
        ? "Switch MetaMask to the configured Clearance402 network."
        : "Wallet connected but not on the configured network.",
      cls: "border-chain-failed/40 bg-chain-failed/10",
    },
  }[status];
  return (
    <div className={cn("mt-6 rounded-2xl border p-4 flex items-start gap-3", map.cls)}>
      <div className="mt-0.5">{map.icon}</div>
      <div className="text-sm">
        <p className="font-semibold">{map.title}</p>
        <p className="text-muted-foreground">{map.text}</p>
      </div>
    </div>
  );
}
