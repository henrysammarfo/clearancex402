import { describe, expect, it } from "vitest";
import { parseVaultUuid } from "./secrets.js";

describe("parseVaultUuid", () => {
  it("parses numeric vault ids", () => {
    expect(parseVaultUuid("42")).toBe(42);
    expect(parseVaultUuid("  7  ")).toBe(7);
  });

  it("rejects non-numeric input", () => {
    expect(parseVaultUuid("vault_abc")).toBeNull();
    expect(parseVaultUuid("")).toBeNull();
    expect(parseVaultUuid("-1")).toBeNull();
  });
});
