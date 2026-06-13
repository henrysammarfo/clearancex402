import { CLEARANCE_CHAIN_ID, CLEARANCE_DEFAULTS } from "@/lib/clearance/network";

/** Browser-safe config from Vite env. */
export function getClientEnv() {
  const rpcUrl =
    import.meta.env.VITE_BASE_SEPOLIA_RPC_URL?.trim() || CLEARANCE_DEFAULTS.rpcUrl;
  const chainId = Number(import.meta.env.VITE_CLEARANCE_CHAIN_ID ?? CLEARANCE_CHAIN_ID);
  const explorerTxBaseUrl =
    import.meta.env.VITE_EXPLORER_TX_URL?.trim() || CLEARANCE_DEFAULTS.explorerTxBaseUrl;
  const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();
  const clearanceApiUrl =
    import.meta.env.VITE_CLEARANCE_API_URL?.trim() ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const isProduction =
    import.meta.env.PROD === true ||
    import.meta.env.VITE_APP_ENV?.trim() === "production";

  if (isProduction && !walletConnectProjectId) {
    throw new Error(
      "VITE_WALLETCONNECT_PROJECT_ID is required in production (WalletConnect Cloud project id).",
    );
  }

  if (chainId !== CLEARANCE_CHAIN_ID) {
    console.warn(
      `[Clearance402] VITE_CLEARANCE_CHAIN_ID=${chainId} does not match Base Sepolia (${CLEARANCE_CHAIN_ID}).`,
    );
  }

  return {
    rpcUrl,
    chainId,
    explorerTxBaseUrl,
    clearanceApiUrl,
    walletConnectProjectId: walletConnectProjectId || undefined,
  };
}
