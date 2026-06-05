# Vercel production environment

Copy these into **Project → Settings → Environment Variables** (Production).

## Server only (never `VITE_`)

| Key | Example |
|-----|---------|
| `IPFS_PROXY_URL` | `http://64.176.181.71:8787` |
| `IPFS_PROXY_SECRET` | *(from VPS `.env`)* |
| `IPFS_GATEWAY_URL` | `http://64.176.181.71:8080/ipfs` |
| `REGISTRY_API_URL` | `http://64.176.181.71:8788` |
| `REGISTRY_PROXY_SECRET` | *(same as IPFS secret is OK)* |
| `STORACHA_PRINCIPAL` | *(from Storacha CLI)* |
| `STORACHA_PROOF` | *(base64 delegation)* |
| `USE_AUTOMATA_DCAP_FIXTURE` | `1` **required** *(Intel DCAP V5 fixture in repo)* |
| `AUTOMATA_DCAP_QUOTE_FILE` | `fixtures/automata/alibaba-v5-quote.hex` |

**Do not set** `WALLET_PRIVATE_KEY` on Vercel.

## Generate import file from `.env.local`

```bash
npm run vercel:import-env
# → vercel.import.env.tmp (gitignored) — import in Vercel dashboard, then:
npm run vercel:import-cleanup
```

## Public (`VITE_`)

| Key | Value |
|-----|--------|
| `VITE_STORY_RPC_URL` | `https://aeneid.storyrpc.io` |
| `VITE_STORY_API_URL` | *(optional)* `https://linestack.vercel.app/api/story-api` — auto-set on HTTPS if omitted |
| `VITE_STORY_CHAIN_ID` | `1315` |
| `VITE_STORY_EXPLORER_TX_URL` | `https://aeneid.storyscan.io/tx/` |
| `VITE_LINESTACK_DATASET_REGISTRY` | `0x176018c6c8c445807fe3688f463487e4b01c8ae3` |
| `VITE_LINESTACK_TEMPLATE_REGISTRY` | `0xe39d684dede7d04c063121878c6c52a223b82e0c` |
| `VITE_WALLETCONNECT_PROJECT_ID` | **required** — [WalletConnect Cloud](https://cloud.walletconnect.com) |

## Deploy settings

`vercel.json` already sets:

- `buildCommand`: `npm run build:core && npm run build`
- `outputDirectory`: `.vercel/output` (Nitro SSR — do **not** use `dist/client` or SPA rewrites)
- `framework`: `null` (Build Output API from Nitro)

**Do not** add a `functions.runtime` block in `vercel.json` — Nitro writes `.vercel/output/functions/__server.func/.vc-config.json` (`nodejs22.x`). A manual `functions` section causes: `Function Runtimes must have a valid version`.

**Vercel dashboard → Settings → Node.js Version:** **22.x** (matches `package.json` `engines.node` and Nitro). Avoid 24.x unless Vercel + Nitro both support it for your preset.

## Post-deploy smoke

1. Open `/status` — RPC green.  
2. Open `/api/registry/status` — `available: true`.  
3. Open `/api/ipfs/status` — `available: true`.  
4. Create vault on production URL; second browser sees it in dashboard/listings.

Addresses: `contracts/deployed.aeneid.json`.
