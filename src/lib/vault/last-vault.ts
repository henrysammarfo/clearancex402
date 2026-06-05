const LAST_VAULT_KEY = "linestack.vaultline.lastVaultId";

export function rememberLastVaultId(vaultId: string): void {
  if (typeof window === "undefined" || !vaultId.trim()) return;
  window.sessionStorage.setItem(LAST_VAULT_KEY, vaultId.trim());
}

export function readLastVaultId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(LAST_VAULT_KEY);
}
