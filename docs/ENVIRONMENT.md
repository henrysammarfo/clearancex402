# Environment variables

**Security classes:** `PUBLIC` | `SECRET` | `SERVER_ONLY`

Templates: [.env.example](../.env.example) (web) · [.linestack.env.example](../.linestack.env.example) (CLI / MCP / SDK)

## Required for CDR (Aeneid)

| Variable | Class | Default | Description |
|----------|-------|---------|-------------|
| `STORY_RPC_URL` | PUBLIC | `https://aeneid.storyrpc.io` | EVM JSON-RPC |
| `STORY_API_URL` | PUBLIC | `http://172.192.41.96:1317` | Story-API (`CDRClient.apiUrl`) |
| `STORY_NETWORK` | PUBLIC | `testnet` | CDR SDK network param |
| `STORY_CHAIN_ID` | PUBLIC | `1315` | Chain ID |

## Browser (`VITE_*` only — never secrets)

| Variable | Notes |
|----------|-------|
| `VITE_STORY_RPC_URL` | Same as `STORY_RPC_URL` |
| `VITE_STORY_API_URL` | Same as `STORY_API_URL` |
| `VITE_STORY_CHAIN_ID` | `1315` |
| `VITE_WALLETCONNECT_PROJECT_ID` | RainbowKit (required on Vercel) |

**Never** `VITE_WALLET_PRIVATE_KEY`.

## Server-only (Vercel / VPS)

| Variable | Purpose |
|----------|---------|
| `STORACHA_PRINCIPAL` / `STORACHA_PROOF` | Upload delegations — [STORACHA-CLI.md](./STORACHA-CLI.md) |
| `IPFS_PROXY_URL` / `IPFS_PROXY_SECRET` | VPS IPFS proxy — [IPFS-VPS.md](./IPFS-VPS.md) |
| `LINESTACK_REGISTRY_URL` / `LINESTACK_REGISTRY_SECRET` | Shared registry — [REGISTRY-VPS.md](./REGISTRY-VPS.md) |
| `USE_AUTOMATA_DCAP_FIXTURE` | `1` on Vercel for demo attestation |
| `WALLET_PRIVATE_KEY` | **Local / CLI / smoke tests only** — never Vercel |

## Optional

| Variable | Description |
|----------|-------------|
| `STORY_EXPLORER_TX_URL` | Default `https://aeneid.storyscan.io/tx/` |
| `CDR_TIMEOUT_MS` | Default `120000` |
| `AUTOMATA_DCAP_QUOTE_HEX` | Your TEE quote (overrides fixture) |
| `ALCHEMY_API_KEY` | Optional faster RPC |

## Contract addresses

See `contracts/deployed.aeneid.json` and `@line-stack/cdr-core` Aeneid config — not duplicated here.

## Local setup

```bash
cp .env.example .env.local
# Fund: https://faucet.story.foundation
npm run hackathon:check
```

See [SECURITY.md](../SECURITY.md) for key handling.
