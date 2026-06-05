# Line Stack beta — 50 testers + 50 developers

**Network:** Story Aeneid (chain id **1315**) only.  
**Faucet:** https://faucet.story.foundation  
**Explorer:** https://aeneid.storyscan.io  

Everyone shares the **same marketplace data** (listings, datasets, requests) via our registry API. Use the **production URL** your team gives you — not only `localhost`.

---

## For testers (web app)

### Before you start

1. Install [MetaMask](https://metamask.io) (or Rabby).
2. Add **Story Aeneid** (chain 1315) — the app will prompt if wrong chain.
3. Get testnet **IP** from the faucet (needed for license mint fees).

### Vaultline (licensed files) — ~15 min

| Step | Route | Who |
|------|--------|-----|
| 1 | Connect wallet | You |
| 2 | Create vault | Publisher |
| 3 | Upload file (>1 KB) | Publisher |
| 4 | Register IP + listing | Publisher |
| 5 | Open **Listings** → copy listing id / link | Buyer (second wallet or incognito) |
| 6 | Buy license | Buyer |
| 7 | Unlock file | Buyer |

**Pass:** Buyer sees the file bytes. Publisher and buyer both see the same listing in **Listings**.

### Queryline (licensed answers) — ~15 min

| Step | Route | Who |
|------|--------|-----|
| 1 | Create dataset | Publisher |
| 2 | Dataset detail → **Seed sample rows** | Publisher |
| 3 | Register template (e.g. `avg_value_by_region`) | Publisher |
| 4 | Request query `{ "region": "EU" }` | Buyer |
| 5 | Dashboard → **Fulfill** | Publisher |
| 6 | Results → **Unlock** | Buyer |

**Pass:** Buyer sees computed answer (e.g. average), not the full raw dataset.

### Honest limit (say this in feedback)

Query **execution** runs on the publisher side today (real CDR decrypt → compute → encrypt result). Story enclave query APIs are not in `cdr-sdk@0.2.1` yet. Data isolation is real: buyers never get access to the dataset vault.

### Common issues

| Symptom | Fix |
|---------|-----|
| Listing / dataset “not found” | Use the **deployed app URL**; wait 10s and refresh (registry sync). |
| Wrong network | Switch wallet to **Aeneid 1315**. |
| Buy license fails | Listing needs `licenseTermsId` — publisher must **Register IP** again on a fresh vault if old. |
| Fulfill disabled | Only **dataset owner** can fulfill; request must be **pending**. |
| Unlock unauthorized | Buyer wallet must match the wallet that **requested** the query / **bought** the license. |
| Tx stuck | Try again; public RPC can be slow — use Settings RPC if provided. |

---

## For developers (CLI / SDK / MCP)

### One-time setup

```bash
# 1. Fund a throwaway testnet wallet
# 2. Create config (chmod 600 on Mac/Linux)
mkdir -p ~/.linestack
```

Copy [`.linestack.env.example`](../.linestack.env.example) to `~/.linestack/.env` and fill secrets (never commit).

```bash
# 3. Install (after npm publish) OR use monorepo:
npm install -g @line-stack/cli
# or: npm run linestack -- status   # from repo root

# 4. Verify
npm run test:beta-env    # from repo, or linestack status
linestack registry-refresh
```

### Required env

| Variable | Purpose |
|----------|---------|
| `WALLET_PRIVATE_KEY` | Signs CDR + Story txs |
| `STORY_RPC_URL` | Aeneid RPC |
| `IPFS_PROXY_URL` + `IPFS_PROXY_SECRET` | File upload/unlock |
| `REGISTRY_API_URL` + `REGISTRY_PROXY_SECRET` | Shared app state |
| `LINESTACK_*` registry + condition addresses | On-chain dataset/template |
| `STORACHA_PROOF` | Only for `vaultline register-ip` |

Contract addresses (Aeneid): see `contracts/deployed.aeneid.json`.

### Quick CLI path

```bash
linestack status
linestack vaultline create-vault --name demo
# note vaultUuid from registry / list
linestack vaultline register-ip --vault-uuid <uuid> --title "Beta IP"
linestack queryline create-dataset --name patients
linestack queryline seed --dataset-id <id> --file ./sample-dataset.json
linestack queryline add-template --dataset-id <id> --name avg_value_by_region
linestack queryline request-query --dataset-id <id> --template-id <tid> --params '{"region":"EU"}'
linestack queryline fulfill --request-id <rid>
linestack queryline unlock-result --request-id <rid>
```

Sample dataset JSON:

```json
{
  "rows": [{ "region": "EU", "value": 42 }, { "region": "US", "value": 37 }]
}
```

### MCP (Cursor / Claude Desktop / Code)

Full guide: [AGENT-INTEGRATIONS.md](./AGENT-INTEGRATIONS.md). Copy [docs/config/cursor-mcp.json](./config/cursor-mcp.json) into Cursor **Settings → MCP** or project `.cursor/mcp.json`.

Tools match CLI exactly (17 tools). Fulfill = `queryline_execute_query`.

### SDK

```ts
import { loadLineStackEnv, LineStack } from "@line-stack/sdk";
loadLineStackEnv();
const ls = new LineStack();
await ls.connect();
await ls.refreshRegistry();
```

See [SDK-CLI-MCP.md](./SDK-CLI-MCP.md).

---

## Feedback we want

- Tx hashes when something fails (copy from UI).
- Wallet address + route (e.g. `/vaultline/listings/.../buy`).
- “Expected vs actual” in one sentence.

---

## Links

- [QUERYLINE.md](./QUERYLINE.md) — architecture & enclave roadmap  
- [REGISTRY-VPS.md](./REGISTRY-VPS.md) — shared state  
- [HACKATHON.md](./HACKATHON.md) — 5‑minute demo script  
- [BETA-OPS.md](./BETA-OPS.md) — ops / backups (maintainers)
