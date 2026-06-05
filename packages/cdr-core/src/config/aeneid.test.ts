import { describe, expect, it } from "vitest";
import {
  AENEID_CHAIN_ID,
  AENEID_CONDITION_CONTRACTS,
  AENEID_DEFAULTS,
  AENEID_SYSTEM_CONTRACTS,
  explorerTxUrl,
} from "./aeneid.js";

describe("Aeneid constants (Story docs)", () => {
  it("matches documented chain ID 1315", () => {
    expect(AENEID_CHAIN_ID).toBe(1315);
  });

  it("uses official default RPC and Story-API URLs", () => {
    expect(AENEID_DEFAULTS.rpcUrl).toBe("https://aeneid.storyrpc.io");
    expect(AENEID_DEFAULTS.storyApiUrl).toBe("http://172.192.41.96:1317");
    expect(AENEID_DEFAULTS.cdrNetwork).toBe("testnet");
  });

  it("exposes system contracts from runtime configuration docs", () => {
    expect(AENEID_SYSTEM_CONTRACTS.dkg).toBe("0xCcCcCC0000000000000000000000000000000004");
    expect(AENEID_SYSTEM_CONTRACTS.cdr).toBe("0xCcCcCC0000000000000000000000000000000005");
  });

  it("exposes deployed condition contracts from cdr-sdk README", () => {
    expect(AENEID_CONDITION_CONTRACTS.ownerWrite).toBe(
      "0x4C9bFC96d7092b590D497A191826C3dA2277c34B",
    );
    expect(AENEID_CONDITION_CONTRACTS.licenseRead).toBe(
      "0xC0640AD4CF2CaA9914C8e5C44234359a9102f7a3",
    );
  });

  it("builds explorer tx URLs", () => {
    expect(explorerTxUrl("https://aeneid.storyscan.io/tx/", "0xabc")).toBe(
      "https://aeneid.storyscan.io/tx/0xabc",
    );
  });
});
