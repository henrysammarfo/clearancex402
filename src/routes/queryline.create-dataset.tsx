import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CdrTransactionForm } from "@/components/forms/CdrTransactionForm";
import { addDataset, appendQuerylineAudit } from "@/lib/queryline/registry";
import { linestackDatasetAllocateConditions } from "@/lib/cdr/linestack-allocate";
import {
  contractsReady,
  registerDatasetOnChain,
} from "@/lib/contracts/linestack-registry";
import { useConnection } from "@/lib/connection";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useQuerylineRegistry } from "@/lib/queryline/use-queryline-registry";

export const Route = createFileRoute("/queryline/create-dataset")({
  head: () => ({ meta: [{ title: "Queryline · Create dataset" }] }),
  component: Page,
});

function Page() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schemaJson, setSchemaJson] = useState(
    '{\n  "columns": [\n    { "name": "region", "type": "string" },\n    { "name": "value", "type": "number", "sensitivity": "high" }\n  ]\n}',
  );
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const onChain = contractsReady();
  const { syncing, error } = useQuerylineRegistry();

  return (
    <AppShell
      product="queryline"
      title="Create dataset vault"
      description={
        onChain
          ? "Allocates a CDR vault and registers the dataset on-chain (shared across all beta testers)."
          : "Allocates a real CDR vault on Story Aeneid. Deploy Line Stack contracts to enable shared on-chain registry."
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />
      <div className="max-w-2xl">
        <CdrTransactionForm
          label="Allocate dataset vault"
          pendingLabel="Allocating CDR dataset vault on Aeneid…"
          onValidate={() => {
            if (name.trim().length < 3) return "Dataset name must be at least 3 characters.";
            try {
              JSON.parse(schemaJson);
            } catch {
              return "Schema must be valid JSON.";
            }
            return null;
          }}
          onExecute={async ({ uploader, address, walletClient, publicClient }) => {
            const cond = linestackDatasetAllocateConditions(address);
            const { uuid, txHash } = await uploader.allocate({
              updatable: false,
              ...cond,
            });
            const id = onChain ? `chain-${uuid}` : crypto.randomUUID();
            setDatasetId(id);

            let registryTx: `0x${string}` | undefined;
            if (onChain && walletClient && publicClient) {
              const reg = await registerDatasetOnChain(walletClient, publicClient, {
                cdrUuid: uuid,
                name: name.trim(),
                schemaJson,
              });
              registryTx = reg.txHash;
            }

            await addDataset({
              id,
              name: name.trim(),
              description: description.trim(),
              schemaJson,
              cdrUuid: String(uuid),
              owner: address,
              allocateTxHash: txHash,
              createdAt: new Date().toISOString(),
            });
            await appendQuerylineAudit({
              actor: address,
              action: registryTx ? "queryline.dataset.registerOnChain" : "queryline.dataset.allocate",
              target: String(uuid),
              txHash: registryTx ?? txHash,
              status: "success",
            });
            return { txHash, data: { datasetId: id, cdrUuid: String(uuid), registryTx } };
          }}
          successTitle="Dataset vault allocated"
          buildSuccessDescription={({ data }) =>
            `CDR UUID ${data?.cdrUuid ?? "—"}. Seed encrypted rows next, then register query templates.`
          }
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. patients-2026-q1" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this dataset contain?" />
          </div>
          <div className="space-y-2">
            <Label>Schema (JSON)</Label>
            <Textarea className="font-mono text-xs" rows={10} value={schemaJson} onChange={(e) => setSchemaJson(e.target.value)} />
          </div>
        </CdrTransactionForm>

        {datasetId && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/queryline/datasets/$id" params={{ id: datasetId }}>
                Open dataset
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/queryline/query-templates">Add templates</Link>
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
