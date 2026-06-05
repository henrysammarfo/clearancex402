import { describe, expect, it } from "vitest";
import { AENEID_CHAIN_ID } from "../config/aeneid.js";
import type { LineStackConfig } from "../env/schema.js";
import { createLineStackCdrClient, createStoryPublicClient } from "./create-cdr-client.js";

const baseConfig: LineStackConfig = {
  rpcUrl: "https://aeneid.storyrpc.io",
  storyApiUrl: "http://172.192.41.96:1317",
  cdrNetwork: "testnet",
  chainId: AENEID_CHAIN_ID,
  explorerTxBaseUrl: "https://aeneid.storyscan.io/tx/",
  cdrTimeoutMs: 120_000,
  logLevel: "error",
};

describe("createLineStackCdrClient", () => {
  it("creates read-only CDRClient without wallet", () => {
    const { client, publicClient, walletClient } = createLineStackCdrClient({
      config: baseConfig,
    });
    expect(client).toBeDefined();
    expect(client.observer).toBeDefined();
    expect(publicClient.chain?.id).toBe(AENEID_CHAIN_ID);
    expect(walletClient).toBeUndefined();
  });

  it("createStoryPublicClient uses Aeneid chain", () => {
    const pc = createStoryPublicClient(baseConfig);
    expect(pc.chain?.id).toBe(1315);
  });
});
