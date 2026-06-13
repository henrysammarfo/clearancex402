import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { clearanceBaseSepolia } from "@/lib/clearance/network";
import { getClientEnv } from "@/lib/env/client";

const APP_NAME = "Clearance402";

export function createWagmiConfig() {
  const { rpcUrl, walletConnectProjectId } = getClientEnv();

  if (!walletConnectProjectId) {
    console.warn(
      "[Clearance402] VITE_WALLETCONNECT_PROJECT_ID is not set. Injected wallets (e.g. MetaMask) work, " +
        "but the full WalletConnect modal and mobile WC are disabled.",
    );
  }

  return getDefaultConfig({
    appName: APP_NAME,
    projectId: walletConnectProjectId || "00000000000000000000000000000000",
    chains: [clearanceBaseSepolia],
    transports: {
      [clearanceBaseSepolia.id]: http(rpcUrl),
    },
    ssr: true,
  });
}
