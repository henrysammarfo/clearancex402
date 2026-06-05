import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { parseEther } from "viem";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  NotConnectedState,
  SuccessState,
  TxFailedState,
  TxPendingState,
} from "@/components/states";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useConnection } from "@/lib/connection";
import { createBrowserStoryClient } from "@/lib/story/client";
import { mintBuyerLicense } from "@/lib/story/mint-license";
import { explorerTxUrl } from "@line-stack/cdr-core";
import { useVaultlineRegistry } from "@/lib/vault/use-vaultline-registry";
import { getVault } from "@/lib/vault/registry";
import { TxFlowActions } from "@/components/tx/TxFlowActions";
import { getBuyerLicenseForListing, saveBuyerLicense } from "@/lib/vault/buyer-licenses";
import { appendAuditAndNotify } from "@/lib/vault/registry";

export const Route = createFileRoute("/vaultline/listings/$id/buy")({
  head: ({ params }) => ({ meta: [{ title: `Vaultline · Buy license ${params.id}` }] }),
  component: Page,
});

type Phase = "idle" | "pending" | "success" | "failed" | "not-connected";

function Page() {
  const { id } = Route.useParams();
  const { listings, ready, syncing, error: registryError } = useVaultlineRegistry();
  const listing = listings.find((l) => l.id === id);
  const { config, isConnected, isWrongChain, walletAddress } = useConnection();
  const { data: walletClient } = useWalletClient();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ licenseTokenId: string; mintTxHash?: string } | null>(null);

  const existing = walletAddress ? getBuyerLicenseForListing(id, walletAddress) : undefined;

  async function handleBuy() {
    setError(null);
    setResult(null);

    if (!listing) {
      setError(ready ? "Listing not found in shared registry." : "Loading registry…");
      setPhase("failed");
      return;
    }
    if (!listing.licenseTermsId) {
      setError(
        "This listing has no licenseTermsId (register IP again on a fresh vault, or enter terms id manually in a future build).",
      );
      setPhase("failed");
      return;
    }
    if (!isConnected || !walletAddress || !walletClient) {
      setPhase("not-connected");
      return;
    }
    if (
      listing.allowedBuyer &&
      listing.allowedBuyer.toLowerCase() !== walletAddress.toLowerCase()
    ) {
      setError(
        `This listing is private. Only ${listing.allowedBuyer} can mint a license.`,
      );
      setPhase("failed");
      return;
    }
    if (isWrongChain) {
      setError("Switch to Story Aeneid (1315).");
      setPhase("failed");
      return;
    }

    setPhase("pending");
    try {
      const storyClient = createBrowserStoryClient(walletClient);
      const mintFee = listing.priceWei ? BigInt(listing.priceWei) : parseEther("0.01");
      const minted = await mintBuyerLicense({
        storyClient,
        licensorIpId: listing.ipId,
        licenseTermsId: BigInt(listing.licenseTermsId),
        mintFeeWei: mintFee > 0n ? mintFee : parseEther("1"),
      });

      const licenseTokenId = String(minted.licenseTokenId);
      await saveBuyerLicense({
        listingId: id,
        ipId: listing.ipId,
        licenseTokenId,
        licenseTermsId: listing.licenseTermsId,
        buyer: walletAddress,
        mintTxHash: minted.mintTxHash,
        purchasedAt: new Date().toISOString(),
      });

      await appendAuditAndNotify({
        actor: walletAddress,
        action: "story.mintLicense",
        target: `${listing.ipId}/${licenseTokenId}`,
        txHash: minted.mintTxHash ?? "—",
        status: "success",
      });

      setResult({ licenseTokenId, mintTxHash: minted.mintTxHash });
      setPhase("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("failed");
      await appendAuditAndNotify({
        actor: walletAddress ?? "unknown",
        action: "story.mintLicense",
        target: id,
        txHash: "—",
        status: "failed",
      });
    }
  }

  if (!ready) {
    return (
      <AppShell product="vaultline" title="Buy license" description="Loading marketplace…">
        <RegistrySyncBanner syncing={syncing} error={registryError} />
        <EmptyState title="Loading listing" description="Fetching listings from the shared registry (cached data shows first when available)." />
      </AppShell>
    );
  }

  if (!listing) {
    return (
      <AppShell product="vaultline" title="Buy license" description="Listing not found.">
        <RegistrySyncBanner syncing={syncing} error={registryError} />
        <p className="text-sm text-muted-foreground">
          No listing <code className="text-xs">{id}</code> in the shared registry.{" "}
          <Link to="/vaultline/ip-register" className="underline">Register IP</Link> first.
        </p>
      </AppShell>
    );
  }

  const explorerBase = config?.explorerBaseUrl ?? "https://aeneid.storyscan.io/tx/";
  const seller =
    listing.seller ?? getVault(listing.vaultUuid)?.owner ?? "—";
  const isPrivate = Boolean(listing.allowedBuyer);

  return (
    <AppShell
      product="vaultline"
      title="Buy license"
      description={`Mint a Story license token for "${listing.title}" — required for CDR LicenseReadCondition unlock.`}
    >
      <div className="max-w-xl space-y-6">
        <RegistrySyncBanner syncing={syncing} error={registryError} />
        <div className="text-sm space-y-2 rounded-lg border p-4">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">IP id</span>
            <span className="font-mono text-[10px] truncate max-w-[220px]" title={listing.ipId}>
              {listing.ipId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">License terms id</span>
            <span className="font-mono text-xs">{listing.licenseTermsId ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Listed price (mint fee hint)</span>
            <span>{(Number(listing.priceWei) / 1e18).toFixed(4)} {listing.currencyLabel}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Seller (licensor)</span>
            <span className="font-mono text-[10px] truncate max-w-[220px]" title={seller}>
              {seller}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Sale type</span>
            <span className="text-xs">
              {isPrivate ? `Private → ${listing.allowedBuyer?.slice(0, 10)}…` : "Open marketplace"}
            </span>
          </div>
        </div>

        {existing && (
          <p className="text-sm text-muted-foreground">
            You already hold license token <span className="font-mono">{existing.licenseTokenId}</span> for
            this listing.{" "}
            <Button asChild variant="link" className="h-auto p-0">
              <Link
                to="/vaultline/unlock"
                search={{ vaultId: listing.vaultUuid, fileId: undefined }}
              >
                Go to unlock
              </Link>
            </Button>
          </p>
        )}

        {phase === "idle" && (
          <>
            <div className="space-y-2">
              <Label>Minting as (buyer wallet)</Label>
              <Input value={walletAddress ?? ""} readOnly placeholder="Connect wallet" />
              <p className="text-xs text-muted-foreground">
                {isPrivate
                  ? "Only the allowed buyer address above can mint. License unlock uses this wallet."
                  : "Anyone on the open marketplace can mint. License unlock uses this wallet — not the seller."}
              </p>
            </div>
            <Button onClick={handleBuy} disabled={!isConnected || isWrongChain}>
              Mint license (WIP wrap + approve + mint)
            </Button>
            <p className="text-xs text-muted-foreground">
              Real on-chain txs on Aeneid. You need testnet IP for WIP deposit. After mint, unlock files
              uploaded with license read conditions.
            </p>
          </>
        )}

        {phase === "not-connected" && <NotConnectedState />}
        {phase === "pending" && (
          <>
            <TxPendingState description="Wrapping IP, approving RoyaltyModule, minting license token…" />
            <TxFlowActions
              phase="pending"
              pendingHint="You may see 2–3 MetaMask prompts (wrap, approve, mint)."
              onCancel={() => setPhase("idle")}
            />
          </>
        )}
        {phase === "failed" && <TxFailedState error={error ?? "Mint failed"} onRetry={() => setPhase("idle")} />}
        {phase === "success" && result && (
          <SuccessState
            title="License minted"
            description={`License token id ${result.licenseTokenId}. Use Unlock with this listing's files.`}
            txHash={result.mintTxHash}
            action={
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/vaultline/unlock" search={{ vaultId: listing.vaultUuid }}>
                    Unlock files
                  </Link>
                </Button>
                {result.mintTxHash && (
                  <Button asChild size="sm" variant="outline">
                    <a href={explorerTxUrl(explorerBase, result.mintTxHash)} target="_blank" rel="noreferrer">
                      View mint tx
                    </a>
                  </Button>
                )}
              </div>
            }
          />
        )}
      </div>
    </AppShell>
  );
}
