# Beta operations (maintainers)

Run through this **before** inviting 50 testers + 50 developers.

## Pre-launch checklist

- [ ] `npm run hackathon:check` passes
- [ ] `npm run test:registry` and `npm run test:ipfs` pass
- [ ] Vercel production deploy live ([VERCEL-ENV.md](./VERCEL-ENV.md))
- [ ] Two-wallet E2E recorded once (Vaultline + Queryline)
- [ ] `npm publish` all four `@line-stack/*` packages (optional: pin versions in onboarding doc)
- [ ] Registry + IPFS secrets rotated if ever exposed
- [ ] `WALLET_PRIVATE_KEY` **not** on Vercel

## VPS (`64.176.181.71`)

| Service | Port | Health |
|---------|------|--------|
| IPFS proxy | 8787 | `curl -H "Authorization: Bearer $SECRET" http://HOST:8787/health` |
| Registry API | 8788 | same pattern `/health` |
| IPFS gateway | 8080 | public read |

### Registry backup (daily)

On the server:

```bash
cd /opt/linestack-ipfs
docker compose exec registry-api cat /data/registry.json > /root/backups/registry-$(date +%F).json
```

Keep 7 days. Restore: stop container, replace `/data/registry.json`, start.

### If registry corrupts

1. Restore latest backup.  
2. If none: users re-create listings from chain IP ids where possible; datasets still on-chain events.

### Load (100 users)

- Registry is one JSON file — fine for beta.  
- Watch disk on IPFS volume.  
- If pin storms: rate-limit at nginx (future) or temporary cap uploads in UI copy.

## Monitoring (minimal)

- Uptime ping: `:8787/health`, `:8788/health`, Vercel `/api/registry/status`, `/api/ipfs/status`
- Alert if health non-200 for 5 minutes

## Incident response

| Issue | Action |
|-------|--------|
| Leaked `IPFS_PROXY_SECRET` | Rotate on VPS `.env`, Vercel, all `~/.linestack/.env`, redeploy compose |
| Leaked wallet key | Drain/rotate wallet; never used on Vercel |
| App 503 registry | Check `registry-api` container; disk full |
| Everyone “listing not found” | Registry down or wrong `REGISTRY_API_URL` on Vercel |

## Support macros (Discord / email)

**Listing not found:** Use the official beta URL (not localhost). Hard refresh. If publisher just created it, wait 15s.

**Wrong chain:** Switch MetaMask to Story Aeneid (1315).

**Queryline:** Buyer only unlocks **after** publisher Fulfill on dashboard.
