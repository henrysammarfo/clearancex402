# Shared registry (VPS)

Vaultline listings, vault metadata, Queryline requests, and buyer licenses are stored in a **single JSON snapshot** on your VPS—not in browser `localStorage`. All users of the deployed app share the same registry.

## Architecture

```
Browser → /api/registry (TanStack server) → registry-api :8788 (VPS) → /data/registry.json
```

- **registry-api** (`infra/registry-api/server.mjs`) — Bearer auth, same pattern as IPFS proxy.
- **App** — `REGISTRY_API_URL` + `REGISTRY_PROXY_SECRET` on the server only (never `VITE_*`).

On-chain dataset/template registries are unchanged; the VPS registry holds app metadata (names, requests, listings) and merges with chain index in the UI.

## Deploy on VPS

From the repo on the server (same host as IPFS):

```bash
cd infra
# Add to .env next to IPFS_PROXY_SECRET:
# REGISTRY_PROXY_SECRET=your_secret   # or reuse IPFS_PROXY_SECRET

docker compose up -d registry-api
curl -H "Authorization: Bearer $REGISTRY_PROXY_SECRET" http://127.0.0.1:8788/health
```

Open port **8788** in the firewall only if the app runs off-VPS (e.g. Vercel). Restrict by IP or keep registry reachable only from your app’s egress.

## Local / Vercel env

In `.env.local` (and Vercel project env):

```env
REGISTRY_API_URL=http://YOUR_VPS:8788
REGISTRY_PROXY_SECRET=...   # same as on VPS
```

## Smoke test

```bash
npm run test:registry
```

## One-time migration

On first load, if the shared registry is empty but this browser still has old `linestack.vaultline.*` / `linestack.queryline.*` keys, the app uploads them automatically and sets `linestack.registry.migrated.v1`.

## What stays in localStorage

- Wallet connection / RPC settings (`connection.tsx`)
- Storacha local proof (sensitive, per device)
- Audit table UI filters (not product data)
