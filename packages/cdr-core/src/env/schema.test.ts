import { describe, expect, it } from "vitest";
import { AENEID_CHAIN_ID } from "../config/aeneid.js";
import { envToConfig, lineStackEnvSchema, loadConfigFromEnv } from "./schema.js";

describe("lineStackEnvSchema", () => {
  it("applies documented defaults when env is empty", () => {
    const env = lineStackEnvSchema.parse({});
    expect(env.STORY_RPC_URL).toBe("https://aeneid.storyrpc.io");
    expect(env.STORY_API_URL).toBe("http://172.192.41.96:1317");
    expect(env.STORY_CHAIN_ID).toBe(AENEID_CHAIN_ID);
  });

  it("rejects wrong chain id at config conversion", () => {
    const env = lineStackEnvSchema.parse({ STORY_CHAIN_ID: "1" });
    expect(() => envToConfig(env)).toThrow(/1315/);
  });

  it("loadConfigFromEnv reads process-style record", () => {
    const cfg = loadConfigFromEnv({
      STORY_RPC_URL: "https://aeneid.storyrpc.io",
      STORY_API_URL: "http://172.192.41.96:1317",
    });
    expect(cfg.chainId).toBe(1315);
    expect(cfg.cdrNetwork).toBe("testnet");
  });
});
