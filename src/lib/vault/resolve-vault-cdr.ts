import { parseVaultUuid } from "@line-stack/cdr-core";
import { loadVaultFiles, loadVaults } from "./registry";

/**
 * Registry vault keys may be non-numeric (legacy smoke ids). CDR always needs numeric UUID.
 */
export function resolveVaultCdrUuid(vaultKey: string | undefined): {
  registryKey: string | undefined;
  cdrUuid: number | null;
} {
  if (!vaultKey?.trim()) {
    return { registryKey: undefined, cdrUuid: null };
  }
  const registryKey = vaultKey.trim();
  const direct = parseVaultUuid(registryKey);
  if (direct !== null) {
    return { registryKey, cdrUuid: direct };
  }

  const vault = loadVaults().find(
    (v) => v.uuid === registryKey || v.name === registryKey,
  );
  if (vault) {
    const fromVault = parseVaultUuid(vault.uuid);
    if (fromVault !== null) {
      return { registryKey: vault.uuid, cdrUuid: fromVault };
    }
    const embedded = vault.uuid.match(/(\d+)/);
    if (embedded) {
      const fromEmbedded = parseVaultUuid(embedded[1]);
      if (fromEmbedded !== null) {
        return { registryKey: vault.uuid, cdrUuid: fromEmbedded };
      }
    }
  }

  return { registryKey, cdrUuid: null };
}
