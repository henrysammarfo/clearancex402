import { StoryClient } from "@story-protocol/core-sdk";
import { http, type WalletClient } from "viem";

export function createStoryClient(walletClient: WalletClient, rpcUrl: string) {
  return StoryClient.newClientUseWallet({
    chainId: "aeneid",
    transport: http(rpcUrl),
    wallet: walletClient as Parameters<typeof StoryClient.newClientUseWallet>[0]["wallet"],
  });
}
