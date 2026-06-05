import { useMemo } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  createLineStackCdrClient,
  type LineStackCdrClients,
  type LineStackConfig,
} from "@line-stack/cdr-core";
import { getClientEnv, resolveBrowserStoryApiUrl } from "@/lib/env/client";
import type { ConnectionConfig } from "@/lib/connection";

function toLineStackConfig(conn: ConnectionConfig | null): LineStackConfig {
  const env = getClientEnv();
  return {
    rpcUrl: conn?.rpcUrl ?? env.storyRpcUrl,
    storyApiUrl: resolveBrowserStoryApiUrl(conn?.cdrUrl ?? env.storyApiUrl),
    cdrNetwork: "testnet",
    chainId: env.chainId,
    explorerTxBaseUrl: conn?.explorerBaseUrl ?? env.explorerTxBaseUrl,
    cdrTimeoutMs: 120_000,
    logLevel: "info",
  };
}

/**
 * Build a CDR client when wallet + config are ready.
 * Read-only observer works with public client only; uploader/consumer need wallet.
 */
export function useLineStackCdr(connectionConfig: ConnectionConfig | null): {
  ready: boolean;
  readOnly: boolean;
  clients: LineStackCdrClients | null;
  address: `0x${string}` | undefined;
} {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const clients = useMemo(() => {
    if (!publicClient) return null;
    const config = toLineStackConfig(connectionConfig);
    return createLineStackCdrClient({
      config,
      walletClient: walletClient ?? undefined,
    });
  }, [connectionConfig, publicClient, walletClient]);

  return {
    ready: Boolean(publicClient),
    readOnly: !isConnected || !walletClient,
    clients,
    address: address as `0x${string}` | undefined,
  };
}
