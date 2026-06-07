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
  AENEID_DEFAULT_CONFIG,
  type Environment,
  type Network,
} from "@/lib/connection";
import { resolveBrowserStoryApiUrl } from "@/lib/env/client";
import { cn } from "@/lib/utils";
import {
  getLocalStorachaProof,
  setLocalStorachaProof,
  checkStorachaAvailable,
} from "@/lib/storacha/browser-client";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { Lock, ShieldCheck } from "lucide-react";
import { UnauthorizedState } from "@/components/states";

const schema = z.object({
  rpcUrl: z.string().url("Must be a valid URL"),
  cdrUrl: z.string().url("Must be a valid URL"),
  explorerBaseUrl: z.string().url("Must be a valid URL"),
  network: z.enum(["story-testnet", "story-mainnet"]),
  environment: z.enum(["development", "staging", "production"]),
  apiKey: z.string().optional(),
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
      rpcUrl: config?.rpcUrl ?? AENEID_DEFAULT_CONFIG.rpcUrl,
      cdrUrl: config?.cdrUrl ?? AENEID_DEFAULT_CONFIG.cdrUrl,
      explorerBaseUrl: config?.explorerBaseUrl ?? DEFAULT_EXPLORER_BASE_URL,
      network: (config?.network as Network) ?? "story-testnet",
      environment: (config?.environment as Environment) ?? "development",
      apiKey: config?.apiKey ?? "",
    },
    values: config
      ? {
          rpcUrl: config.rpcUrl,
          cdrUrl: config.cdrUrl,
          explorerBaseUrl: config.explorerBaseUrl ?? DEFAULT_EXPLORER_BASE_URL,
          network: config.network,
          environment: config.environment,
          apiKey: config.apiKey ?? "",
        }
      : undefined,
  });

  const onSubmit = form.handleSubmit((vals) => save(vals));

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <SiteHeader />
      <section className="mx-auto max-w-[820px] px-5 sm:px-8 py-10">
        <h1 className="text-3xl font-medium tracking-tight">Settings</h1>
        <p className="text-zinc-600 mt-2">Story Aeneid RPC, CDR Story-API URL, and optional local overrides (saved in your browser).</p>

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
              <Label htmlFor="rpcUrl">Story RPC URL</Label>
              <Input id="rpcUrl" placeholder={AENEID_DEFAULT_CONFIG.rpcUrl} {...form.register("rpcUrl")} />
              {form.formState.errors.rpcUrl && <p className="text-xs text-chain-failed">{form.formState.errors.rpcUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cdrUrl">CDR endpoint</Label>
              <Input id="cdrUrl" placeholder={AENEID_DEFAULT_CONFIG.cdrUrl} {...form.register("cdrUrl")} />
              <p className="text-xs text-muted-foreground">
                On HTTPS (e.g. linestack.vercel.app), plain <code className="text-[11px]">http://</code> Story-API URLs are
                auto-rewritten to{" "}
                <code className="text-[11px] break-all">{resolveBrowserStoryApiUrl("http://example")}</code> so CDR WASM is not
                blocked by mixed content.
              </p>
              {form.formState.errors.cdrUrl && <p className="text-xs text-chain-failed">{form.formState.errors.cdrUrl.message}</p>}
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
                    <SelectItem value="story-testnet">Story testnet</SelectItem>
                    <SelectItem value="story-mainnet">Story mainnet</SelectItem>
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
            <h3 className="font-semibold">Storacha (file uploads)</h3>
            <StorachaSettings />
          </div>

          <div className="rounded-2xl border bg-white p-6 space-y-4">
            <h3 className="font-semibold">API key</h3>
            <div className="space-y-2">
              <Label htmlFor="apiKey">LINESTACK_API_KEY</Label>
              <Input id="apiKey" type="password" placeholder="sk_…" {...form.register("apiKey")} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!form.formState.isDirty && !!config}>Save configuration</Button>
            <Button type="button" variant="outline" onClick={() => { clear(); form.reset({ rpcUrl: "", cdrUrl: "", explorerBaseUrl: DEFAULT_EXPLORER_BASE_URL, network: "story-testnet", environment: "development", apiKey: "" }); }}>
              Clear
            </Button>
            <p className="text-xs text-zinc-500">
              Saved in localStorage. Connect wallet via RainbowKit in the header (chain 1315).
            </p>
          </div>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

function StorachaSettings() {
  const [proof, setProof] = useState(() => getLocalStorachaProof() ?? "");
  const [status, setStatus] = useState<string>("Checking…");

  useEffect(() => {
    checkStorachaAvailable().then((s) => {
      if (s.available) {
        setStatus(s.source === "local" ? "Local CLI proof saved in this browser." : "Server delegation available (STORACHA_PROOF).");
      } else {
        setStatus(s.error ?? "Not configured.");
      }
    });
  }, [proof]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{status}</p>
      <div className="space-y-2">
        <Label htmlFor="storachaProof">Local Storacha proof (dev — from CLI)</Label>
        <Textarea
          id="storachaProof"
          rows={4}
          className="font-mono text-xs"
          placeholder="Paste UCAN proof from storacha CLI (optional if server STORACHA_PROOF is set)"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setLocalStorachaProof(proof);
          }}
        >
          Save local proof
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setLocalStorachaProof(null);
            setProof("");
          }}
        >
          Clear
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Never commit proof material. On Vercel, set STORACHA_PROOF as a server env var only.</p>
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
      text: `Wallet on Story Aeneid · ${walletAddress ?? ""}`,
      cls: "border-chain-success/40 bg-chain-success/10",
    },
    configured: {
      icon: <Plug className="size-5" />,
      title: "Configured · awaiting wallet",
      text: "Endpoints saved. Connect wallet in the header (Story Aeneid, chain 1315).",
      cls: "border-chain-unauthorized/40 bg-chain-unauthorized/10",
    },
    disconnected: {
      icon: <Plug className="size-5" />,
      title: "Disconnected",
      text: "Save endpoints below and connect a wallet to enable CDR flows.",
      cls: "border-border bg-muted/40",
    },
    failed: {
      icon: <ShieldAlert className="size-5" />,
      title: isWrongChain ? "Wrong network" : "Connection failed",
      text: isWrongChain
        ? "Switch MetaMask to Story Aeneid Testnet (chain ID 1315)."
        : "Wallet connected but not on Aeneid.",
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
