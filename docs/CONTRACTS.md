# Line Stack contracts (Aeneid)

Solidity sources: `contracts/src/`

| Contract | Purpose |
|----------|---------|
| `LineStackDatasetRegistry` | On-chain Queryline datasets (CDR UUID + schema) |
| `LineStackTemplateRegistry` | Allow-listed query templates per dataset |
| `LineStackPublisherWriteCondition` | CDR write: only encoded publisher address |
| `LineStackBuyerReadCondition` | CDR read: only encoded buyer address |
| `LineStackMerkleAllowlistReadCondition` | Beta read gate via merkle root + proof |

Built-in Story conditions (`OwnerWrite`, `LicenseRead`) remain in `AENEID_CONDITION_CONTRACTS`.

## Compile

**Option A — Foundry (recommended)**

```bash
cd contracts
forge build
# artifacts in contracts/out/
```

**Option B — WSL / Linux** if Windows lacks Foundry.

**Option C — VPS** (see `scripts/deploy-linestack-vps.sh`)

## Deploy to Aeneid

```bash
# After compile → contracts/out/*.json
node scripts/deploy-linestack-contracts.mjs
```

Writes `contracts/deployed.aeneid.json` and prints env vars.

Add to `.env.local`:

```env
VITE_LINESTACK_DATASET_REGISTRY=0x...
VITE_LINESTACK_TEMPLATE_REGISTRY=0x...
LINESTACK_DATASET_REGISTRY=0x...
LINESTACK_TEMPLATE_REGISTRY=0x...
LINESTACK_PUBLISHER_WRITE_CONDITION=0x...
LINESTACK_BUYER_READ_CONDITION=0x...
LINESTACK_MERKLE_ALLOWLIST_READ_CONDITION=0x...
```

Restart `npm run dev`. Queryline will register datasets/templates on-chain and index events for all beta users.

## Beta tester merkle allowlist

```bash
# testers.txt — one address per line
node scripts/generate-beta-merkle.mjs testers.txt
```

Sets `LINESTACK_BETA_MERKLE_ROOT` and writes proofs for MCP/CLI.

Use `encodeMerkleAllowlistReadConditionData(root)` + `encodeMerkleAllowlistAccessAuxData(proof)` from `@line-stack/cdr-core` when allocating sensitive vaults.

## Beta checklist

1. Deploy contracts once on Aeneid testnet.
2. Set env on Vercel + local.
3. Publisher: create dataset → on-chain register → seed rows → register template.
4. Buyer: request query → publisher fulfill → buyer unlock.
5. Confirm datasets/templates visible from a second browser/wallet (chain index).
