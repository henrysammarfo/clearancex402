import { useCallback, useEffect, useMemo, useState } from "react";
import { lineStackContractsConfigured } from "@line-stack/cdr-core";
import { QUERYLINE_REGISTRY_EVENT } from "@/lib/registry/events";
import {
  ensureRegistryLoaded,
  getRegistrySnapshot,
  hasRegistryCacheOnDisk,
  refreshRegistrySnapshot,
} from "@/lib/registry/store";
import {
  loadDatasets,
  loadQuerylineAudit,
  loadRequests,
  loadTemplates,
  type DatasetRecord,
  type QueryTemplateRecord,
} from "@/lib/queryline/registry";
import { fetchOnChainDatasets, fetchOnChainTemplates } from "@/lib/contracts/linestack-registry";
import { useLineStackCdr } from "@/lib/cdr/use-linestack-cdr";
import { useConnection } from "@/lib/connection";

const POLL_MS = 30_000;

function mergeDatasets(local: DatasetRecord[], chain: DatasetRecord[]): DatasetRecord[] {
  const byUuid = new Map<string, DatasetRecord>();
  for (const d of chain) byUuid.set(d.cdrUuid, d);
  for (const d of local) {
    const existing = byUuid.get(d.cdrUuid);
    if (existing) {
      byUuid.set(d.cdrUuid, { ...existing, id: d.id, description: d.description || existing.description });
    } else {
      byUuid.set(d.cdrUuid, d);
    }
  }
  return [...byUuid.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function mergeTemplates(local: QueryTemplateRecord[], chain: QueryTemplateRecord[]): QueryTemplateRecord[] {
  const byId = new Map<string, QueryTemplateRecord>();
  for (const t of chain) byId.set(t.id, t);
  for (const t of local) if (!byId.has(t.id)) byId.set(t.id, t);
  const byName = new Map<string, QueryTemplateRecord>();
  for (const t of byId.values()) {
    const key = `${t.datasetId}::${t.name.trim().toLowerCase()}`;
    const existing = byName.get(key);
    if (
      !existing ||
      new Date(t.createdAt).getTime() >= new Date(existing.createdAt).getTime()
    ) {
      byName.set(key, t);
    }
  }
  return [...byName.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function readQuerylineState() {
  return {
    datasets: loadDatasets(),
    templates: loadTemplates(),
    requests: loadRequests(),
    audit: loadQuerylineAudit(),
  };
}

export function useQuerylineRegistry() {
  const hadCache = useMemo(() => hasRegistryCacheOnDisk(), []);
  const [ready, setReady] = useState(
    hadCache || getRegistrySnapshot().queryline.datasets.length > 0,
  );
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [chainDatasets, setChainDatasets] = useState<DatasetRecord[]>([]);
  const [chainTemplates, setChainTemplates] = useState<QueryTemplateRecord[]>([]);
  const { config } = useConnection();
  const { clients } = useLineStackCdr(config);

  const refreshRemote = useCallback(async () => {
    setSyncing(true);
    try {
      await refreshRegistrySnapshot();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setTick((t) => t + 1);
      setReady(true);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureRegistryLoaded();
        if (!cancelled) await refreshRemote();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setReady(true);
          setSyncing(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshRemote]);

  useEffect(() => {
    const onUpdate = () => void refreshRemote();
    window.addEventListener(QUERYLINE_REGISTRY_EVENT, onUpdate);
    const t = setInterval(() => void refreshRemote(), POLL_MS);
    return () => {
      window.removeEventListener(QUERYLINE_REGISTRY_EVENT, onUpdate);
      clearInterval(t);
    };
  }, [refreshRemote]);

  useEffect(() => {
    if (!lineStackContractsConfigured() || !clients?.publicClient) {
      setChainDatasets([]);
      setChainTemplates([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [ds, ts] = await Promise.all([
          fetchOnChainDatasets(clients.publicClient),
          fetchOnChainTemplates(clients.publicClient),
        ]);
        if (!cancelled) {
          setChainDatasets(ds);
          setChainTemplates(ts);
        }
      } catch {
        if (!cancelled) {
          setChainDatasets([]);
          setChainTemplates([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clients?.publicClient, tick]);

  void tick;

  const localDatasets = loadDatasets();
  const localTemplates = loadTemplates();

  return {
    datasets: mergeDatasets(localDatasets, chainDatasets),
    templates: mergeTemplates(localTemplates, chainTemplates),
    requests: loadRequests(),
    audit: loadQuerylineAudit(),
    onChainEnabled: lineStackContractsConfigured(),
    ready,
    syncing,
    error,
    refresh: refreshRemote,
  };
}
