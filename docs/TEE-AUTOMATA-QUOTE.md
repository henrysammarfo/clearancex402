# Automata DCAP quote: demo fixture vs your TEE

## What production uses today

| Mode | Env | Meaning |
|------|-----|---------|
| **Demo (default)** | `USE_AUTOMATA_DCAP_FIXTURE=1` | Reads `fixtures/automata/alibaba-v5-quote.hex` — a **real** Intel DCAP quote from Automata’s public fixtures. `verifyAndAttestOnChain` on Story Aeneid succeeds and produces a **real tx hash**. It does **not** prove *your* fulfill binary ran in *your* TEE. |
| **Your TEE** | `AUTOMATA_DCAP_QUOTE_HEX=0x…` | Quote bytes from **your** enclave after you run the fulfill workload inside TEE. Same on-chain contract; judges can tie attestation to your operator. |

Set **one** path on Vercel:

- Hackathon / live demo with tx proof: keep `USE_AUTOMATA_DCAP_FIXTURE=1` (no hex in repo secrets).
- Strongest story: unset `USE_AUTOMATA_DCAP_FIXTURE`, set `AUTOMATA_DCAP_QUOTE_HEX` only (server env, never `VITE_`).

## How to get a real quote (when you have TEE infra)

1. Run your allow-listed template **inside** the TEE (Intel TDX/SGX, or cloud confidential VM with DCAP).
2. Export the **DCAP quote** from that environment (vendor tooling or Automata samples).
3. Paste hex into Vercel → `AUTOMATA_DCAP_QUOTE_HEX` (full `0x…` string).
4. Redeploy. Browser fulfill calls `GET /api/automata/quote` → server returns your hex → publisher wallet submits `verifyAndAttestOnChain`.

Local:

```bash
# .env.local (never commit)
AUTOMATA_DCAP_QUOTE_HEX=0x...
# USE_AUTOMATA_DCAP_FIXTURE=0   # or remove it
npm run vercel:import-env
```

## Extract helper (Automata upstream fixtures)

```bash
node scripts/extract-automata-quote.mjs path/to/AutomataDcapOnChainAttestationTest.t.sol v3
```

V5 on Aeneid is what we ship (`alibaba-v5-quote.hex`); older v3/v4 forge quotes often fail with `TCBR` on testnet.
