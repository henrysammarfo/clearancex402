import {
  EMPTY_REGISTRY_SNAPSHOT,
  fetchRegistrySnapshot,
  isRegistryConfigured,
  registryMutate,
  type RegistryMutate,
  type RegistrySnapshot,
} from "@line-stack/cdr-core";
import type { LineStackState } from "../state/file-store.js";

export class RemoteRegistry {
  private snapshot: RegistrySnapshot = structuredClone(EMPTY_REGISTRY_SNAPSHOT);

  configured(): boolean {
    return isRegistryConfigured();
  }

  get(): RegistrySnapshot {
    return this.snapshot;
  }

  async refresh(): Promise<RegistrySnapshot> {
    if (!isRegistryConfigured()) {
      throw new Error(
        "Shared registry not configured. Set REGISTRY_API_URL + REGISTRY_PROXY_SECRET in ~/.linestack/.env",
      );
    }
    this.snapshot = await fetchRegistrySnapshot();
    return this.snapshot;
  }

  async mutate(mutate: RegistryMutate): Promise<RegistrySnapshot> {
    this.snapshot = await registryMutate(mutate);
    return this.snapshot;
  }

  async migrateLocalStateOnce(local: LineStackState): Promise<void> {
    if (!isRegistryConfigured()) return;
    await this.refresh();
    const hasRemote =
      this.snapshot.vaultline.vaults.length > 0 ||
      this.snapshot.queryline.datasets.length > 0 ||
      this.snapshot.queryline.requests.length > 0;
    const hasLocal =
      local.vaults.length > 0 || local.datasets.length > 0 || local.requests.length > 0;
    if (hasRemote || !hasLocal) return;

    for (const v of local.vaults) {
      await this.mutate({
        op: "upsert",
        path: "vaultline.vaults",
        record: {
          uuid: v.id,
          name: v.name,
          owner: v.owner,
          allocateTxHash: v.allocateTxHash,
          createdAt: new Date().toISOString(),
        },
      });
    }
    for (const d of local.datasets) {
      await this.mutate({
        op: "upsert",
        path: "queryline.datasets",
        record: {
          id: d.id,
          name: d.name,
          description: "",
          schemaJson: d.schemaJson,
          cdrUuid: d.cdrUuid,
          owner: d.owner,
          allocateTxHash: "—",
          createdAt: new Date().toISOString(),
        },
      });
    }
    for (const t of local.templates) {
      await this.mutate({
        op: "upsert",
        path: "queryline.templates",
        record: {
          id: t.id,
          datasetId: t.datasetId,
          name: t.name,
          description: "",
          paramsSchemaJson: "{}",
          createdAt: new Date().toISOString(),
        },
      });
    }
    for (const r of local.requests) {
      await this.mutate({
        op: "upsert",
        path: "queryline.requests",
        record: {
          id: r.id,
          datasetId: r.datasetId,
          templateId: r.templateId,
          buyer: r.buyer,
          paramsJson: r.paramsJson,
          status: r.status,
          resultCdrUuid: r.resultCdrUuid,
          createdAt: new Date().toISOString(),
        },
      });
    }
  }
}
