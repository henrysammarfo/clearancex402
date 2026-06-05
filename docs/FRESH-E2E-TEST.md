# Fresh E2E test (start here)

Quick path from zero. **Full copy-paste steps:** [E2E-TESTING-PLAYBOOK.md](./E2E-TESTING-PLAYBOOK.md).

Test **https://linestack.vercel.app** with **real** Story Aeneid (1315) + CDR + VPS registry — no mocked txs.

**Wallets:** Publisher (funded) + Buyer (second wallet / incognito, fund with testnet IP).

---

## 0. Automated preflight (your machine)

```bash
npm run hackathon:smoke    # registry VPS + live URLs
npm run test:registry      # registry upsert + delete
npm run test:ipfs          # if IPFS_PROXY_* set
```

VPS registry must be on **v2** (`delete` + `revision`). Redeploy:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-registry-vps.ps1
# then on VPS: docker compose stop registry-api && docker compose start registry-api
```

---

## 1. Vaultline — Publisher

| # | Action | Route |
|---|--------|-------|
| 1 | Connect wallet (Aeneid 1315) | `/login` or header |
| 2 | Dashboard loads without long 0/0/0 flash | `/vaultline/dashboard` |
| 3 | Create vault (one MetaMask tx) | `/vaultline/create-vault` |
| 4 | **Vault dropdown**, upload PDF (> 1 KB) | `/vaultline/upload` |
| 5 | Register IP + listing (public or **private buyer**) | `/vaultline/ip-register` |
| 6 | Vault detail: rename, files, optional registry file remove | `/vaultline/vaults/$uuid` |
| 7 | Audit: success rows + tx hashes | `/vaultline/audit` |

---

## 2. Vaultline — Buyer (incognito / second wallet)

| # | Action | Route |
|---|--------|-------|
| 8 | Listing — **Seller** vs buyer wallet shown | `/vaultline/listings/$id` |
| 9 | Buy license (2–3 MetaMask prompts) | `/vaultline/listings/$id/buy` |
| 10 | Unlock via **file row** (CDR file uuid) | `/vaultline/unlock` |

---

## 3. Queryline

| # | Wallet | Action | Route |
|---|--------|--------|-------|
| 11 | Publisher | Create dataset vault | `/queryline/create-dataset` |
| 12 | Publisher | Seed sample rows (see playbook JSON) | `/queryline/datasets/$id` |
| 13 | Publisher | Add template `avg_value_by_region` | `/queryline/query-templates` |
| 14 | Buyer | Request query `{ "region": "EU" }` | `/queryline/request-query` |
| 15 | Publisher | Fulfill (decrypt + template + result vault + attestation) | `/queryline/dashboard` |
| 16 | Buyer | Unlock result only | `/queryline/results/$id` |

**Expected result:** `avg_value: 40` for EU.

---

## 4. What “success” looks like

- Audit log rows with **real tx hashes** on Storyscan
- Registry: `/api/registry/status` → `{"available":true}`
- Upload: **file CDR uuid** in sidebar
- Queryline fulfill: attestation + optional Automata tx on explorer

---

## 5. Known limits (honest, not bugs)

- **Queryline compute** runs on publisher machine today (not CDR enclave `executeQuery` yet).
- **IPFS uploads** may need **2** wallet signatures (allocate file vault + write).
- **Registry file delete** removes index only — on-chain CDR data remains.
- **Private listings** enforce buyer wallet at mint time in the app.

More: [E2E-TESTING-PLAYBOOK.md](./E2E-TESTING-PLAYBOOK.md) · [SMOKE-TEST-CHECKLIST.md](./SMOKE-TEST-CHECKLIST.md) · [OPS-RUNBOOK.md](./OPS-RUNBOOK.md)
