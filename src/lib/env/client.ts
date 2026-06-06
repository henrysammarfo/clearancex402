import { AENEID_CHAIN_ID, AENEID_DEFAULTS } from "@line-stack/cdr-core";

const HTTPS_STORY_API_PROXY_PATH = "/api/story-api";

/**
 * On HTTPS pages, never call the upstream Story-API over plain HTTP (mixed content).
 * Rewrites http:// URLs and empty env to the same-origin Vercel proxy.
 */
export function resolveBrowserStoryApiUrl(preferred?: string): string {
  const raw =
    preferred?.trim() ||
    import.meta.env.VITE_STORY_API_URL?.trim() ||
    AENEID_DEFAULTS.storyApiUrl;

  if (typeof window === "undefined") {
    return raw.replace(/\/$/, "");
  }

  if (window.location.protocol === "https:") {
    const normalized = raw.replace(/\/$/, "");
    if (!normalized || normalized.startsWith("http://")) {
      return `${window.location.origin}${HTTPS_STORY_API_PROXY_PATH}`.replace(/\/$/, "");
    }
    return normalized;
  }

  return raw.replace(/\/$/, "");
}

/** Browser-safe config from Vite env (Vercel: set in dashboard). */
export function getClientEnv() {
  const storyRpcUrl =
    import.meta.env.VITE_STORY_RPC_URL?.trim() || AENEID_DEFAULTS.rpcUrl;
  const storyApiUrl = resolveBrowserStoryApiUrl();
  const chainId = Number(import.meta.env.VITE_STORY_CHAIN_ID ?? AENEID_CHAIN_ID);
  const explorerTxBaseUrl =
    import.meta.env.VITE_STORY_EXPLORER_TX_URL?.trim() ||
    AENEID_DEFAULTS.explorerTxBaseUrl;
  const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();
  const isProduction =
    import.meta.env.PROD === true ||
    import.meta.env.VITE_APP_ENV?.trim() === "production";

  if (isProduction && !walletConnectProjectId) {
    throw new Error(
      "VITE_WALLETCONNECT_PROJECT_ID is required in production (WalletConnect Cloud project id).",
    );
  }

  if (chainId !== AENEID_CHAIN_ID) {
    console.warn(
      `[Clearance402] VITE_STORY_CHAIN_ID=${chainId} does not match Aeneid (${AENEID_CHAIN_ID}).`,
    );
  }

  return {
    storyRpcUrl,
    storyApiUrl,
    chainId,
    explorerTxBaseUrl,
    walletConnectProjectId: walletConnectProjectId || undefined,
  };
}
