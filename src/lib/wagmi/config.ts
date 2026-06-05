import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { storyAeneid } from "@line-stack/cdr-core";
import { getClientEnv } from "@/lib/env/client";

function buildTransports(rpcUrl: string) {
  return {
    [storyAeneid.id]: http(rpcUrl),
  } as const;
}

const APP_NAME = "Line Stack";

/**
 * RainbowKit wallet picker (MetaMask, Rainbow; full list with WalletConnect project id).
 * Set `VITE_WALLETCONNECT_PROJECT_ID` from https://cloud.walletconnect.com for full modal + mobile WC.
 */
export function createWagmiConfig() {
  const { storyRpcUrl, walletConnectProjectId } = getClientEnv();
  const transports = buildTransports(storyRpcUrl);

  if (!walletConnectProjectId) {
    throw new Error(
      "VITE_WALLETCONNECT_PROJECT_ID is required. Create a project at https://cloud.walletconnect.com",
    );
  }

  return getDefaultConfig({
    appName: APP_NAME,
    projectId: walletConnectProjectId,
    chains: [storyAeneid],
    transports,
    ssr: true,
  });
}
