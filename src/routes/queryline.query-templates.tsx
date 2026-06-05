import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/states";
import { CdrTransactionForm } from "@/components/forms/CdrTransactionForm";
import { RegistrySyncBanner } from "@/components/registry/RegistrySyncBanner";
import { useQuerylineRegistry } from "@/lib/queryline/use-queryline-registry";
import {
  appendQuerylineAudit,
  findTemplateByName,
  upsertTemplateByName,
} from "@/lib/queryline/registry";
import { registerTemplateOnChain } from "@/lib/contracts/linestack-registry";

export const Route = createFileRoute("/queryline/query-templates")({
  head: () => ({ meta: [{ title: "Queryline · Query templates" }] }),
  component: Page,
});

function Page() {
  const { datasets, templates, onChainEnabled, syncing, error } = useQuerylineRegistry();
  const [datasetId, setDatasetId] = useState("");
  const [name, setName] = useState("avg_value_by_region");
  const [description, setDescription] = useState("Average value for a region");
  const [dsl, setDsl] = useState("SELECT AVG(value) AS avg_value FROM dataset WHERE region = :region");
  const [paramsSchema, setParamsSchema] = useState(
    '{ "region": { "type": "string", "enum": ["EU", "US", "APAC"] } }',
  );

  const selected = datasets.find((d) => d.id === datasetId);
  const existing = datasetId && name.trim().length >= 2 ? findTemplateByName(datasetId, name) : undefined;

  return (
    <AppShell
      product="queryline"
      title="Query templates"
      description={
        onChainEnabled
          ? "Register allow-listed queries on Story Aeneid + shared registry (real tx)."
          : "Line Stack contract addresses not loaded — check /status."
      }
    >
      <RegistrySyncBanner syncing={syncing} error={error} />
      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="max-w-2xl space-y-4">
          <div className="space-y-2">
            <Label>Dataset</Label>
            <Select value={datasetId} onValueChange={setDatasetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No datasets — create one first
                  </SelectItem>
                ) : (
                  datasets.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} (CDR {d.cdrUuid})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Template name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="avg_value_by_region" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>SQL / DSL (documentation)</Label>
            <Textarea className="font-mono text-xs" rows={3} value={dsl} onChange={(e) => setDsl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Allowed params (JSON)</Label>
            <Textarea className="font-mono text-xs" rows={4} value={paramsSchema} onChange={(e) => setParamsSchema(e.target.value)} />
          </div>

          {existing && (
            <p className="text-xs text-muted-foreground rounded-md border bg-muted/40 px-3 py-2">
              Template <strong>{existing.name}</strong> already exists for this dataset — registering again updates the shared registry entry (same name).
            </p>
          )}

          {onChainEnabled && selected ? (
            <CdrTransactionForm
              label={existing ? "Update template on-chain" : "Register template on-chain"}
              pendingLabel="Submitting template registry transaction…"
              onValidate={() => {
                if (!datasetId || name.trim().length < 2) return "Select dataset and template name.";
                try {
                  JSON.parse(paramsSchema);
                } catch {
                  return "Params schema must be valid JSON.";
                }
                return null;
              }}
              onExecute={async ({ address, walletClient, publicClient }) => {
                if (!walletClient || !publicClient) throw new Error("Wallet required.");
                const cdrUuid = Number.parseInt(selected.cdrUuid, 10);
                const { txHash, templateId } = await registerTemplateOnChain(
                  walletClient,
                  publicClient,
                  {
                    datasetCdrUuid: cdrUuid,
                    name: name.trim(),
                    paramsSchemaJson: paramsSchema,
                  },
                );
                await upsertTemplateByName({
                  id: templateId,
                  datasetId,
                  name: name.trim(),
                  description: description.trim() || dsl.slice(0, 80),
                  paramsSchemaJson: paramsSchema,
                  createdAt: new Date().toISOString(),
                });
                await appendQuerylineAudit({
                  actor: address,
                  action: "queryline.template.registerOnChain",
                  target: templateId,
                  txHash,
                  status: "success",
                });
                toast.success("Template registered on-chain", {
                  description: `${name.trim()} · ${templateId.slice(0, 10)}…`,
                });
                return { txHash, data: { templateId } };
              }}
              successTitle="Template registered on-chain"
              buildSuccessDescription={({ data }) => `Template id ${data?.templateId ?? "—"}`}
            />
          ) : (
            <p className="text-sm text-chain-failed">
              Connect wallet and ensure Line Stack contracts are configured (see /status).
            </p>
          )}
        </div>
        <aside>
          {templates.length === 0 ? (
            <EmptyState title="No templates yet" />
          ) : (
            <ul className="text-sm space-y-3 max-h-[70vh] overflow-y-auto">
              {templates.map((t) => (
                <li key={t.id} className="border rounded-md p-3 min-w-0">
                  <p className="font-medium break-words">{t.name}</p>
                  <p className="text-xs text-muted-foreground break-all font-mono">{t.id}</p>
                  {t.description && (
                    <p className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">{t.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
