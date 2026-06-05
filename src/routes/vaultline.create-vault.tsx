import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CdrTransactionForm } from "@/components/forms/CdrTransactionForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addVaultAndNotify, appendAuditAndNotify } from "@/lib/vault/registry";
import { rememberLastVaultId } from "@/lib/vault/last-vault";

export const Route = createFileRoute("/vaultline/create-vault")({
  head: () => ({ meta: [{ title: "Vaultline · Create vault" }] }),
  component: Page,
});

function Page() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vaultUuid, setVaultUuid] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <AppShell
      product="vaultline"
      title="Create vault"
      description="Allocates a real CDR vault on Story Aeneid with owner-only read/write (your connected wallet)."
    >
      <div className="max-w-2xl">
        <CdrTransactionForm
          key={formKey}
          label="Create vault on-chain"
          pendingLabel="Allocating CDR vault on Story Aeneid…"
          onValidate={() => (name.trim().length < 3 ? "Vault name must be at least 3 characters." : null)}
          onSuccess={() => {
            setName("");
            setDescription("");
            setFormKey((k) => k + 1);
          }}
          onExecute={async ({ uploader, address }) => {
            const { uuid, txHash } = await uploader.allocate({
              updatable: false,
              writeConditionAddr: address,
              readConditionAddr: address,
              writeConditionData: "0x",
              readConditionData: "0x",
              skipConditionValidation: true,
            });
            const vaultId = String(uuid);
            setVaultUuid(vaultId);
            rememberLastVaultId(vaultId);

            await addVaultAndNotify({
              uuid: vaultId,
              name: name.trim(),
              owner: address,
              allocateTxHash: txHash,
              createdAt: new Date().toISOString(),
            });
            await appendAuditAndNotify({
              actor: address,
              action: "vault.allocate",
              target: vaultId,
              txHash,
              status: "success",
            });

            return {
              txHash,
              data: { vaultUuid: vaultId, name: name.trim() },
            };
          }}
          successTitle="Vault allocated"
          buildSuccessDescription={({ data }) =>
            `Vault "${data?.name ?? name}" is on-chain. UUID: ${data?.vaultUuid ?? vaultUuid ?? "—"}. Upload a file next.`
          }
        >
          <div className="space-y-2">
            <Label htmlFor="name">Vault name (off-chain label)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ghana-creator-signal-pack"
            />
            <p className="text-xs text-muted-foreground">
              Stored in your app metadata later; the chain records the vault UUID from CDR.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this vault contain? Who is it for?"
            />
          </div>
        </CdrTransactionForm>

        {vaultUuid && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/vaultline/upload" search={{ vaultId: vaultUuid }}>
                Upload file to this vault
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
};
