import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { storyAeneid } from "@line-stack/cdr-core";
import { getClientEnv } from "@/lib/env/client";

function buildTransports(rpcUrl: string) {
  return {
    [storyAeneid.id]: http(rpcUrl),
  } as const;
}

const APP_NAME = "Clearance402";

/**
 * RainbowKit wallet picker (MetaMask, Rainbow; full list with WalletConnect project id).
 * Set `VITE_WALLETCONNECT_PROJECT_ID` from https://cloud.walletconnect.com for full modal + mobile WC.
 */
export function createWagmiConfig() {
  const { storyRpcUrl, walletConnectProjectId } = getClientEnv();
  const transports = buildTransports(storyRpcUrl);

  if (!walletConnectProjectId) {
    console.warn(
      "[Clearance402] VITE_WALLETCONNECT_PROJECT_ID is not set. Injected wallets (e.g. MetaMask) work, " +
        "but the full WalletConnect modal and mobile WC are disabled. Add a project id from " +
        "https://cloud.walletconnect.com to enable them.",
    );
  }

  return getDefaultConfig({
    appName: APP_NAME,
    // RainbowKit requires a non-empty string; use a placeholder when none is configured.
    projectId: walletConnectProjectId || "00000000000000000000000000000000",
    chains: [storyAeneid],
    transports,
    ssr: true,
  });
}
