# Line Stack ops runbook (production)

## Registry (authoritative)

- **Storage:** VPS `registry-api` → `registry.json` on Docker volume (`infra/registry-api/server.mjs`).
- **Web proxy:** Vercel `REGISTRY_API_URL` + `REGISTRY_PROXY_SECRET` (or `IPFS_PROXY_SECRET`).
- **Browser cache:** `localStorage` key `linestack.registry.snapshot.v1` (stale-while-revalidate only).
- **v2 features:** `revision` counter, `delete` mutate, file lock on write.

### Env (required for shared data)

| Variable | Where |
|----------|--------|
| `REGISTRY_API_URL` | Vercel + local `.env` |
| `REGISTRY_PROXY_SECRET` | Vercel + VPS registry-api + local |

### Smoke

```bash
npm run test:registry
npm run hackathon:smoke
```

### Backup registry

```bash
docker compose -f infra/docker-compose.yml exec registry-api cat /data/registry.json > registry-backup-$(date +%F).json
```

### Redeploy registry-api after code change

```bash
cd infra && docker compose up -d --build registry-api
```

## IPFS file upload

| Variable | Purpose |
|----------|---------|
| `IPFS_PROXY_URL` | VPS upload proxy base |
| `IPFS_PROXY_SECRET` | Bearer for proxy + registry fallback |

See `docs/IPFS-VPS.md`.

## Storacha (fallback metadata / uploads)

| Variable | Purpose |
|----------|---------|
| `STORACHA_PROOF` | Server delegation (CLI/MCP) |
| Browser | Settings → paste proof; upload uses `addSpace(delegation)` |

## Story Aeneid

- Chain ID **1315**
- Wallet on Aeneid for all CDR + PIL txs

## E2E paths (manual)

**Vaultline:** create vault → upload (PDF/IPFS) → register IP → listing → (buyer wallet) buy license → unlock via **file row** (CDR uuid).

**Queryline:** create dataset → seed → template → request → publisher fulfill on dashboard → buyer unlock result.

## Post-hackathon (not in this deploy)

- Postgres migration (optional; VPS JSON + revision is current production path).
- CDR `executeQuery` in enclave (Queryline compute today is publisher-side + Automata attest).
