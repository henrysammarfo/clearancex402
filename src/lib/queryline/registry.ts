import type { AuditEntry } from "@/components/tables/AuditLogTable";
import { QUERYLINE_REGISTRY_EVENT } from "@/lib/registry/events";
import { getRegistrySnapshot, registryMutate } from "@/lib/registry/store";

export type DatasetRecord = {
  id: string;
  name: string;
  description: string;
  schemaJson: string;
  cdrUuid: string;
  owner: string;
  allocateTxHash: string;
  createdAt: string;
};

export type QueryTemplateRecord = {
  id: string;
  datasetId: string;
  name: string;
  description: string;
  paramsSchemaJson: string;
  createdAt: string;
};

export type QueryRequestRecord = {
  id: string;
  datasetId: string;
  templateId: string;
  buyer: string;
  paramsJson: string;
  status: "pending" | "completed" | "failed";
  resultCdrUuid?: string;
  resultVaultAllocateTx?: string;
  resultWriteTx?: string;
  attestation?: {
    bindingHash: string;
    signature: string;
    signer: string;
    signedAt: string;
    automata?: { txHash: string; success: boolean };
  };
  createdAt: string;
  completedAt?: string;
};

export { QUERYLINE_REGISTRY_EVENT };

export function notifyQuerylineRegistryUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(QUERYLINE_REGISTRY_EVENT));
}

export function loadDatasets(): DatasetRecord[] {
  return getRegistrySnapshot().queryline.datasets;
}

export function loadTemplates(): QueryTemplateRecord[] {
  return getRegistrySnapshot().queryline.templates;
}

export function loadRequests(): QueryRequestRecord[] {
  return getRegistrySnapshot().queryline.requests;
}

export function loadQuerylineAudit(): AuditEntry[] {
  return getRegistrySnapshot().queryline.audit;
}

export function getDataset(id: string): DatasetRecord | undefined {
  return loadDatasets().find((d) => d.id === id);
}

export function getTemplatesForDataset(datasetId: string): QueryTemplateRecord[] {
  return loadTemplates().filter((t) => t.datasetId === datasetId);
}

export function getRequest(id: string): QueryRequestRecord | undefined {
  return loadRequests().find((r) => r.id === id);
}

export async function addDataset(record: DatasetRecord): Promise<void> {
  await registryMutate({ op: "upsert", path: "queryline.datasets", record });
}

export async function addTemplate(record: QueryTemplateRecord): Promise<void> {
  await registryMutate({ op: "upsert", path: "queryline.templates", record });
}

export function findTemplateByName(datasetId: string, name: string): QueryTemplateRecord | undefined {
  const key = name.trim().toLowerCase();
  return loadTemplates().find(
    (t) => t.datasetId === datasetId && t.name.trim().toLowerCase() === key,
  );
}

/** One template name per dataset in the shared registry (updates existing row). */
export async function upsertTemplateByName(record: QueryTemplateRecord): Promise<void> {
  const existing = findTemplateByName(record.datasetId, record.name);
  if (existing) {
    await registryMutate({
      op: "patch",
      path: "queryline.templates",
      id: existing.id,
      patch: {
        description: record.description,
        paramsSchemaJson: record.paramsSchemaJson,
        createdAt: record.createdAt,
      },
    });
    return;
  }
  await addTemplate(record);
}

export async function addRequest(record: QueryRequestRecord): Promise<void> {
  await registryMutate({ op: "upsert", path: "queryline.requests", record });
}

export async function updateRequest(
  id: string,
  patch: Partial<QueryRequestRecord>,
): Promise<void> {
  await registryMutate({ op: "patch", path: "queryline.requests", id, patch });
}

export async function appendQuerylineAudit(
  entry: Omit<AuditEntry, "time"> & { time?: string },
): Promise<void> {
  const full = { ...entry, time: entry.time ?? new Date().toISOString() };
  await registryMutate({ op: "append", path: "queryline.audit", record: full });
}

