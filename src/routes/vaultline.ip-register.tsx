import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  NotConnectedState,
  SuccessState,
  TxFailedState,
  TxPendingState,
} from "@/components/states";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { VaultSelect } from "@/components/vault/VaultSelect";
import { useConnection } from "@/lib/connection";
import { useVaultlineRegistry } from "@/lib/vault/use-vaultline-registry";
import { createBrowserStorachaProvider } from "@/lib/storacha/browser-client";
import { createBrowserStoryClient } from "@/lib/story/client";
import {
  explorerIpUrl,
  registerVaultIpAsset,
  type LicenseTemplate,
} from "@/lib/story/register-ip-asset";
import { explorerTxUrl } from "@line-stack/cdr-core";
import {
  addIpAssetAndNotify,
  addListingAndNotify,
  appendAuditAndNotify,
  deleteIpAsset,
  getIpAssetForVault,
} from "@/lib/vault/registry";
import { TxFlowActions } from "@/components/tx/TxFlowActions";
import { useMemo } from "react";

export const Route = createFileRoute("/vaultline/ip-register")({
  validateSearch: z.object({ vaultId: z.string().optional() }),
  head: () => ({ meta: [{ title: "Vaultline · Register IP" }] }),
  component: Page,
});

type Phase = "idle" | "pending" | "success" | "failed" | "not-connected";

const DEFAULT_PRICE = "0.01";

function Page() {
  const { vaultId: vaultIdSearch } = Route.useSearch();
  const { vaults, syncing, error: registryError } = useVaultlineRegistry();
  const { config, isConnected, isWrongChain, walletAddress } = useConnection();
  const { data: walletClient } = useWalletClient();
  const [vaultUuid, setVaultUuid] = useState(vaultIdSearch ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [licenseTemplate, setLicenseTemplate] = useState<LicenseTemplate>("non-commercial");
  const [priceIp, setPriceIp] = useState(DEFAULT_PRICE);
  const [saleMode, setSaleMode] = useState<"public" | "private">("public");
  const [allowedBuyer, setAllowedBuyer] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ ipId: string; txHash: string; listingId: string } | null>(null);

  const myVaults = useMemo(() => {
    if (!walletAddress) return vaults;
    const w = walletAddress.toLowerCase();
    return vaults.filter((v) => v.owner.toLowerCase() === w);
  }, [vaults, walletAddress]);

  const existingIp = vaultUuid ? getIpAssetForVault(vaultUuid) : undefined;

  function resetForm() {
    setTitle("");
    setDescription("");
    setLicenseTemplate("non-commercial");
    setPriceIp(DEFAULT_PRICE);
    setPhase("idle");
    setError(null);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!isConnected || !walletAddress || !walletClient) {
      setPhase("not-connected");
      return;
    }
    if (isWrongChain) {
      setError("Switch to Story Aeneid (1315).");
      setPhase("failed");
      return;
    }
    if (!vaultUuid) {
      setError("Select a vault.");
      setPhase("failed");
      return;
    }
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      setPhase("failed");
      return;
    }
    if (existingIp?.licenseTermsId) {
      setError(`Vault already registered as IP ${existingIp.ipId} with license terms.`);
      setPhase("failed");
      return;
    }
    if (existingIp && !existingIp.licenseTermsId) {
      await deleteIpAsset(existingIp.ipId);
    }
    if (saleMode === "private") {
      const b = allowedBuyer.trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(b)) {
        setError("Private sale requires a valid buyer wallet (0x…).");
        setPhase("failed");
        return;
      }
    }

    setPhase("pending");
    try {
      const storyClient = createBrowserStoryClient(walletClient);
      const registered = await registerVaultIpAsset({
        storyClient,
        resolveStoracha: () => createBrowserStorachaProvider(),
        title: title.trim(),
        description: description.trim(),
        vaultUuid,
        creatorAddress: walletAddress,
        licenseTemplate,
      });

      await addIpAssetAndNotify({
        ipId: registered.ipId,
        vaultUuid,
        title: title.trim(),
        licenseTemplate,
        licenseTermsId: registered.licenseTermsId,
        ipMetadataUri: registered.ipMetadataUri,
        txHash: registered.txHash,
        registeredAt: new Date().toISOString(),
      });

      const listingId = crypto.randomUUID();
      await addListingAndNotify({
        id: listingId,
        vaultUuid,
        ipId: registered.ipId,
        seller: walletAddress,
        allowedBuyer:
          saleMode === "private" ? allowedBuyer.trim().toLowerCase() : undefined,
        title: title.trim(),
        description: description.trim(),
        priceWei: String(Math.floor(Number.parseFloat(priceIp || "0") * 1e18)),
        currencyLabel: "IP (testnet)",
        licenseTemplate,
        licenseTermsId: registered.licenseTermsId,
        createdAt: new Date().toISOString(),
      });

      await appendAuditAndNotify({
        actor: walletAddress,
        action: "story.registerIpAsset",
        target: registered.ipId,
        txHash: registered.txHash,
        status: "success",
      });

      setResult({ ipId: registered.ipId, txHash: registered.txHash, listingId });
      setPhase("success");
      setTitle("");
      setDescription("");
      setPriceIp(DEFAULT_PRICE);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("failed");
    }
  }

  const explorerBase = config?.explorerBaseUrl ?? "https://aeneid.storyscan.io/tx/";

  return (
    <AppShell
      product="vaultline"
      title="Register IP on Story"
      description="Mints an SPG NFT and registers a Story IP Asset with PIL license terms. Metadata uploads via IPFS proxy when configured, else Storacha."
    >
      <RegistrySyncBanner syncing={syncing} error={registryError} />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <VaultSelect
          vaults={myVaults}
          value={vaultUuid}
          syncing={syncing}
          onChange={setVaultUuid}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="IP asset title" /></div>
          <div className="space-y-2"><Label>Creator</Label><Input value={walletAddress ?? ""} readOnly placeholder="Connect wallet" /></div>
        </div>

        <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the IP asset." /></div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>License template</Label>
            <Select value={licenseTemplate} onValueChange={(v) => setLicenseTemplate(v as LicenseTemplate)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="non-commercial">Non-commercial (CC attribution)</SelectItem>
                <SelectItem value="commercial-use">Commercial use</SelectItem>
                <SelectItem value="commercial-remix">Commercial remix</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>List price (IP)</Label><Input type="number" step="0.001" value={priceIp} onChange={(e) => setPriceIp(e.target.value)} /></div>
          <div className="space-y-2"><Label>Currency</Label><Input value="IP (Aeneid)" readOnly /></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Who can buy?</Label>
            <Select value={saleMode} onValueChange={(v) => setSaleMode(v as "public" | "private")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Anyone (open marketplace)</SelectItem>
                <SelectItem value="private">One wallet only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {saleMode === "private" && (
            <div className="space-y-2">
              <Label>Buyer wallet</Label>
              <Input
                value={allowedBuyer}
                onChange={(e) => setAllowedBuyer(e.target.value)}
                placeholder="0x…"
              />
            </div>
          )}
        </div>

        {existingIp && !existingIp.licenseTermsId && (
          <p className="text-xs text-chain-pending rounded-lg border border-chain-pending/40 px-3 py-2">
            This vault has a stale IP record without license terms — submitting will replace it on-chain and in the registry.
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Metadata: IPFS proxy on this deployment (same as file upload), or Storacha (server STORACHA_* or proof in Settings).
          Uses public Aeneid SPG collection from Story docs.
        </p>

        <Button type="submit" disabled={phase === "pending"}>
          {phase === "pending" ? "Registering IP…" : "Register IP + create listing"}
        </Button>

        {phase === "pending" && (
          <>
            <TxPendingState description="Uploading IP metadata and submitting registerIpAsset on Story Aeneid…" />
            <TxFlowActions
              phase="pending"
              pendingHint="MetaMask may ask for one or more signatures."
              onCancel={() => setPhase("idle")}
            />
          </>
        )}
        {phase === "not-connected" && <NotConnectedState />}
        {phase === "failed" && error && (
          <TxFailedState error={error} onRetry={() => setPhase("idle")} />
        )}
        {phase === "success" && result && (
          <SuccessState
            title="IP Asset registered"
            description={`IPA ${result.ipId} registered. Listing created in the shared registry.`}
            txHash={result.txHash}
            action={
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={resetForm}>
                  Register another
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={explorerTxUrl(explorerBase, result.txHash)} target="_blank" rel="noreferrer">View tx</a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={explorerIpUrl(result.ipId)} target="_blank" rel="noreferrer">View IPA</a>
                </Button>
                <Button asChild size="sm">
                  <Link to="/vaultline/listings/$id" params={{ id: result.listingId }}>View listing</Link>
                </Button>
              </div>
            }
          />
        )}
      </form>
    </AppShell>
  );
}
