import { http, type WalletClient } from "viem";
import { StoryClient } from "@story-protocol/core-sdk";
import { getClientEnv } from "@/lib/env/client";

/**
 * Story Protocol client using the connected wagmi wallet (browser signing).
 */
export function createBrowserStoryClient(walletClient: WalletClient) {
  const env = getClientEnv();
  return StoryClient.newClientUseWallet({
    chainId: "aeneid",
    transport: http(env.storyRpcUrl),
    wallet: walletClient as Parameters<typeof StoryClient.newClientUseWallet>[0]["wallet"],
  });
}
