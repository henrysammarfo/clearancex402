import { useCallback, useEffect, useMemo, useState } from "react";
import { ensureRegistryLoaded, getRegistrySnapshot, hasRegistryCacheOnDisk, refreshRegistrySnapshot } from "@/lib/registry/store";
import { VAULTLINE_REGISTRY_EVENT } from "@/lib/registry/events";
import {
  loadAuditEntries,
  loadIpAssets,
  loadListings,
  loadUnlocks,
  loadVaultFiles,
  loadVaults,
  type IpAssetRecord,
  type ListingRecord,
  type VaultFileRecord,
  type VaultRecord,
  type VaultUnlockRecord,
} from "./registry";
import type { AuditEntry } from "@/components/tables/AuditLogTable";

const POLL_MS = 30_000;

function readVaultlineState() {
  return {
    vaults: loadVaults(),
    files: loadVaultFiles(),
    unlocks: loadUnlocks(),
    audit: loadAuditEntries(),
    ipAssets: loadIpAssets(),
    listings: loadListings(),
  };
}

export function useVaultlineRegistry() {
  const hadCache = useMemo(() => hasRegistryCacheOnDisk(), []);
  const [ready, setReady] = useState(hadCache || getRegistrySnapshot().vaultline.vaults.length > 0);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vaults, setVaults] = useState<VaultRecord[]>(() => readVaultlineState().vaults);
  const [files, setFiles] = useState<VaultFileRecord[]>(() => readVaultlineState().files);
  const [unlocks, setUnlocks] = useState<VaultUnlockRecord[]>(() => readVaultlineState().unlocks);
  const [audit, setAudit] = useState<AuditEntry[]>(() => readVaultlineState().audit);
  const [ipAssets, setIpAssets] = useState<IpAssetRecord[]>(() => readVaultlineState().ipAssets);
  const [listings, setListings] = useState<ListingRecord[]>(() => readVaultlineState().listings);

  const applyLocal = useCallback(() => {
    const s = readVaultlineState();
    setVaults(s.vaults);
    setFiles(s.files);
    setUnlocks(s.unlocks);
    setAudit(s.audit);
    setIpAssets(s.ipAssets);
    setListings(s.listings);
  }, []);

  const refresh = useCallback(async () => {
    setSyncing(true);
    try {
      await refreshRegistrySnapshot();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      applyLocal();
      setReady(true);
      setSyncing(false);
    }
  }, [applyLocal]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureRegistryLoaded();
        if (!cancelled) await refresh();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          applyLocal();
          setReady(true);
          setSyncing(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, applyLocal]);

  useEffect(() => {
    const onUpdate = () => {
      applyLocal();
      setReady(true);
    };
    window.addEventListener(VAULTLINE_REGISTRY_EVENT, onUpdate);
    const t = setInterval(() => void refresh(), POLL_MS);
    return () => {
      window.removeEventListener(VAULTLINE_REGISTRY_EVENT, onUpdate);
      clearInterval(t);
    };
  }, [refresh, applyLocal]);

  return { vaults, files, unlocks, audit, ipAssets, listings, ready, syncing, error, refresh };
}
