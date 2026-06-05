# Deployment (Vercel)

**Live:** https://linestack.vercel.app · **Env reference:** [VERCEL-ENV.md](./VERCEL-ENV.md)

## Target

| Item | Value |
|------|-------|
| Build | `npm run build:core && npm run build` |
| Output | `.vercel/output` (Nitro `vercel` preset — **not** static `dist/client`) |
| Framework | TanStack Start SSR via Nitro |

## Deploy steps

1. Push `main` to GitHub (`henrysammarfo/linestack`).
2. Vercel → Import → match `vercel.json` (build + `.vercel/output`).
3. Set env vars from [VERCEL-ENV.md](./VERCEL-ENV.md) (including `USE_AUTOMATA_DCAP_FIXTURE=1` for Queryline attest).
4. Deploy → open `/status` (RPC, registry, IPFS green).

## Production checklist

- [x] CDR vault create / upload / unlock (Vaultline)
- [x] Storacha delegation + `registerIpAsset`
- [x] Buyer license + license-gated decrypt
- [x] Queryline dataset / result vaults + fulfill + Automata
- [x] Shared registry API on VPS
- [x] SDK, CLI, MCP packages build (`npm run build:packages`)

## Rollback

Redeploy a previous Vercel deployment from the dashboard.

## Monitoring

`/status` page, registry `/api/registry/status`, RPC latency, failed decrypt rate in audit logs.
