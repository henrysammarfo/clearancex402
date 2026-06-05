---
name: linestack-cdr-demo
description: Run the Line Stack CDR hackathon demo on Story Aeneid — Vaultline (license file) then Queryline (licensed answer) with real txs. Use when recording a demo video, judging E2E, or proving MCP/CLI parity with linestack.vercel.app.
disable-model-invocation: false
---

# Line Stack — 2–3 minute CDR demo (MCP or CLI)

**Live app:** https://linestack.vercel.app · **Chain:** Story Aeneid (1315)

## Prerequisites

- Wallet on Aeneid with testnet IP ([faucet](https://faucet.story.foundation))
- MCP: `linestack` server configured (`LINESTACK_ENV_FILE` → `~/.linestack/.env`)
- Env: `WALLET_PRIVATE_KEY`, registry + IPFS secrets, `USE_AUTOMATA_DCAP_FIXTURE=1` for fulfill
- **Two wallets** for buyer vs publisher (second browser or `BUYER_WALLET_PRIVATE_KEY`)

## Act 1 — Vaultline (~75s)

1. `linestack_status` — confirm RPC + registry.
2. `vaultline_create_vault` — name `hackathon-demo`.
3. `vaultline_upload_file` — real file >1KB; save `cdrUuid` / listing ids from JSON.
4. `vaultline_register_ip` — title + price (needs `STORACHA_PROOF` in env).
5. Switch to **buyer wallet**.
6. `vaultline_buy_license` — `listingId` from registry.
7. `vaultline_unlock_file` — prove decrypt; capture **explorer tx hash**.

**Say:** “CDR encrypts the file; Story PIL license gates decrypt — no mock.”

## Act 2 — Queryline (~75s)

1. Switch to **publisher wallet**.
2. `queryline_create_dataset` → `queryline_seed_dataset` with `{"rows":[{"region":"EU","value":42},{"region":"US","value":37}]}`.
3. `queryline_add_template` — name `avg_value_by_region`.
4. Switch to **buyer** → `queryline_request_query` — params `{"region":"EU"}`.
5. Publisher → `queryline_execute_query` (fulfill + EIP-712 + Automata on-chain).
6. Buyer → `queryline_unlock_result` — answer only; show **attestation / Automata tx** in UI if using web.

**Say:** “Buyer never gets the dataset vault — only the result vault. Fulfill is publisher-side until Story ships enclave execute; we add Automata DCAP on-chain.”

## Act 3 — Wow close (~15s)

- Open https://linestack.vercel.app/mcp — 17 tools.
- One sentence: “Same registry as the web app — Vaultline + Queryline for the CDR hackathon.”

## CLI equivalents

```bash
linestack status
linestack vaultline create-vault --name hackathon-demo
# … see docs/SDK-CLI-MCP.md
```

## Rules

- Never invent tx hashes or UUIDs.
- If a tool fails, read the JSON error and fix env (registry secret, wrong chain, missing Storacha).
