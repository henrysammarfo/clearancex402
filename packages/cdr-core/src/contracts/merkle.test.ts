import { describe, expect, it } from "vitest";
import { type Address } from "viem";
import { buildMerkleRoot, getMerkleProof, merkleLeafForAddress } from "./merkle.js";

describe("merkle allowlist", () => {
  const a1 = "0x1111111111111111111111111111111111111111" as Address;
  const a2 = "0x2222222222222222222222222222222222222222" as Address;

  it("builds root and proof", () => {
    const leaves = [merkleLeafForAddress(a1), merkleLeafForAddress(a2)];
    const root = buildMerkleRoot(leaves);
    const proof = getMerkleProof(leaves, merkleLeafForAddress(a1));
    expect(root).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(proof.length).toBeGreaterThan(0);
  });
});
