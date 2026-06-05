# Smoke test checklist (fresh run)

**Start here:** [FRESH-E2E-TEST.md](./FRESH-E2E-TEST.md) (quick path) · **Full steps:** [E2E-TESTING-PLAYBOOK.md](./E2E-TESTING-PLAYBOOK.md)

**Live:** https://linestack.vercel.app · **Two wallets** on Story Aeneid (1315).

---

## Automated (run first)

```bash
npm run hackathon:smoke     # registry + key pages (200)
npm run test:registry      # VPS mutate upsert + delete
npm run build:packages     # @line-stack/* workspaces
npm run test:e2e           # full Vaultline + Queryline (needs wallets in .env)
```

Registry v2 on VPS: `scripts/deploy-registry-vps.ps1` then `docker compose stop registry-api && docker compose start registry-api` on server.

---

## UI — latest ship (verify)

- [ ] Dashboard / listings show cached data fast (not 0→N delay)
- [ ] Upload: **vault dropdown**
- [ ] Register IP: **public vs private buyer**
- [ ] Buy page: **Seller** vs **Minting as (buyer)**
- [ ] Unlock: pick **file** from vault list (CDR uuid)
- [ ] Vault detail: rename vault, remove file from registry
- [ ] `/vaultline/vaults` index lists all vaults

---

## Vaultline (Publisher)

| Step | Route |
|------|-------|
| Create vault | `/vaultline/create-vault` |
| Upload | `/vaultline/upload` |
| Register IP | `/vaultline/ip-register` |
| Listings | `/vaultline/listings` |
| Audit | `/vaultline/audit` |

## Vaultline (Buyer)

| Step | Route |
|------|-------|
| Buy license | `/vaultline/listings/:id/buy` |
| Unlock | `/vaultline/unlock` |

---

## Queryline

| Wallet | Step | Route |
|--------|------|-------|
| Publisher | Create dataset | `/queryline/create-dataset` |
| Publisher | Seed | `/queryline/datasets/:id` |
| Publisher | Template | `/queryline/query-templates` |
| Buyer | Request | `/queryline/request-query` |
| Publisher | Fulfill | `/queryline/dashboard` |
| Buyer | Unlock result | `/queryline/results/:id` |

---

## CDR / Story context for demos

See [CDR-WHY-IT-MATTERS.md](./CDR-WHY-IT-MATTERS.md) for judges (what CDR hides, why, gotchas, examples).

---

## Ops

[OPS-RUNBOOK.md](./OPS-RUNBOOK.md) · [REGISTRY-VPS.md](./REGISTRY-VPS.md) · [HACKATHON-SUBMISSION.md](./HACKATHON-SUBMISSION.md)
