import { keccak256, encodeAbiParameters, type Address } from "viem";

/** Leaf = keccak256(abi.encode(address)) — matches LineStackMerkleAllowlistReadCondition. */
export function merkleLeafForAddress(account: Address): `0x${string}` {
  return keccak256(encodeAbiParameters([{ type: "address" }], [account]));
}

function hashPair(a: `0x${string}`, b: `0x${string}`): `0x${string}` {
  const [left, right] = a <= b ? [a, b] : [b, a];
  return keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes32" }],
      [left, right],
    ),
  );
}

/** Build merkle root from tester addresses (beta allowlist). */
export function buildMerkleRoot(leaves: `0x${string}`[]): `0x${string}` {
  if (leaves.length === 0) {
    throw new Error("merkle: no leaves");
  }
  let layer = [...leaves].sort();
  while (layer.length > 1) {
    const next: `0x${string}`[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        next.push(hashPair(layer[i], layer[i + 1]));
      } else {
        next.push(layer[i]);
      }
    }
    layer = next;
  }
  return layer[0];
}

/** Generate merkle proof for a leaf (sorted-tree convention). */
export function getMerkleProof(
  leaves: `0x${string}`[],
  targetLeaf: `0x${string}`,
): `0x${string}`[] {
  const sorted = [...leaves].sort();
  const index = sorted.indexOf(targetLeaf);
  if (index < 0) throw new Error("merkle: leaf not in tree");

  const proof: `0x${string}`[] = [];
  let layer = sorted;
  let idx = index;

  while (layer.length > 1) {
    const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
    if (pairIdx < layer.length) {
      proof.push(layer[pairIdx]);
    }
    const next: `0x${string}`[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        next.push(hashPair(layer[i], layer[i + 1]));
      } else {
        next.push(layer[i]);
      }
    }
    layer = next;
    idx = Math.floor(idx / 2);
  }

  return proof;
}
