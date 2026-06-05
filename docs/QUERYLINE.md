# Queryline — what is fully working today

## Plain English

**Vaultline** = sell files. Encrypt → store → buyer buys license → buyer decrypts. **Fully wired** with real Story + CDR + your Vultr IPFS.

**Queryline** = sell *answers* from a private dataset, not the raw rows.

| Step | Real on-chain / CDR? | What actually happens |
|------|----------------------|------------------------|
| Create dataset vault | Yes | `allocate` on Aeneid |
| Seed dataset rows | Yes | Owner `write` encrypted JSON into dataset vault |
| Register query template | App registry | Allow-list (name + params); not a chain tx yet |
| Buyer requests query | Yes | `allocate` **result vault** (buyer can read, owner can write) |
| Run query | **Partially** | Owner **decrypts dataset** (`accessCDR`), runs template **in the app**, **writes answer** (`write`) to result vault |
| Buyer gets answer | Yes | Buyer `accessCDR` on **result vault only** |

## What is NOT in CDR SDK 0.2.1

There is **no** `executeQuery()` / enclave API in `@piplabs/cdr-sdk` today. The bible’s “CDR runs the query inside the enclave” is the **target** when Story exposes it.

Until then, Line Stack uses an **honest delegated compute** model:

1. Raw data stays in the **dataset vault** (buyer never gets `accessCDR` on it).
2. Only the **publisher** can decrypt the dataset (owner read condition).
3. Publisher runs the **approved template** in `src/lib/queryline/execute-template.ts`.
4. Only the **aggregated answer** goes to the buyer’s **result vault**.

Every crypto step is real CDR. The SQL/aggregation runs off-chain on the publisher machine after decrypt — same as how many “confidential analytics” MVPs work before TEE APIs ship.

## End-to-end test (two wallets)

1. **Publisher:** `/queryline/create-dataset` → `/queryline/datasets/:id` → **Seed sample rows**
2. **Publisher:** `/queryline/query-templates` → register `avg_value_by_region`
3. **Buyer:** `/queryline/request-query` → pick dataset + template + `{ "region": "EU" }`
4. **Publisher:** `/queryline/dashboard` → **Fulfill** (2 CDR txs: read dataset + write result)
5. **Buyer:** `/queryline/results/:id` → **Unlock** → see `avg_value: 42` from seeded rows

## When Story adds enclave execution

Replace the body of `fulfill()` with the official CDR job/execute call; keep the same vault layout (dataset vault + per-buyer result vault).

## Stronger trust later (TEE — your layer, not CDR)

Story confirmed: **publisher fulfill + result vault is the right interim**; running queries inside a TEE is **out of CDR scope** today. When you want buyers to verify execution (not just crypto access), plan:

1. Run fulfill compute in **your TEE** (same template allow-list).
2. Sign outputs + job metadata inside the enclave.
3. Anchor verification via **Automata attestation on-chain** (no Story protocol changes).

Line Stack can add this as an optional “attested fulfill” mode without changing vault layout.
