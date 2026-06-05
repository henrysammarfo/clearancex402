# SDK, CLI, and MCP

CLI, SDK, and MCP share the **same VPS registry** as the web app (`REGISTRY_API_URL` + `REGISTRY_PROXY_SECRET`), Story IP registration, on-chain dataset/template registries, and Automata DCAP on Queryline fulfill.

**Agent setup (all hosts):** [AGENT-INTEGRATIONS.md](./AGENT-INTEGRATIONS.md)  
**npm release:** [PUBLISHING.md](./PUBLISHING.md)

---

## Install

```bash
# After npm publish
npm install -g @line-stack/cli @line-stack/mcp-server
npm install @line-stack/sdk

# Monorepo (before publish)
npm run build:packages
npm run linestack -- status
```

---

## Environment (`~/.linestack/.env`)

Copy [.linestack.env.example](../.linestack.env.example). Loaded via `LINESTACK_ENV_FILE`, cwd `.env.local`, or `~/.linestack/.env`.

| Variable | Required |
|----------|----------|
| `WALLET_PRIVATE_KEY` | Always (signs CDR + Story) |
| `STORY_RPC_URL` | Recommended (Aeneid default in code) |
| `IPFS_PROXY_URL` + `IPFS_PROXY_SECRET` | File upload/unlock |
| `REGISTRY_API_URL` + `REGISTRY_PROXY_SECRET` | Shared app state |
| `LINESTACK_DATASET_REGISTRY` | Queryline on-chain register |
| `LINESTACK_TEMPLATE_REGISTRY` | Template on-chain register |
| `LINESTACK_PUBLISHER_WRITE_CONDITION` | Publisher fulfill write |
| `LINESTACK_BUYER_READ_CONDITION` | Buyer result read |
| `STORACHA_PROOF` | `vaultline register-ip` only |
| `USE_AUTOMATA_DCAP_FIXTURE=1` or `AUTOMATA_DCAP_QUOTE_HEX` | `queryline fulfill` / MCP `queryline_execute_query` |

Addresses: `contracts/deployed.aeneid.json`.

---

## CLI reference

Global:

```bash
linestack status
linestack registry-refresh
```

### Vaultline

```bash
linestack vaultline create-vault --name "demo"
linestack vaultline write-secret --uuid <cdrUuid> --text "hello"
linestack vaultline read-secret --uuid <cdrUuid>
linestack vaultline upload-file --file ./data.bin --vault-uuid <vaultId>
linestack vaultline register-ip --vault-uuid <vaultId> --title "My IP" --price-ip 0.01
linestack vaultline buy-license --listing-id <id>
linestack vaultline unlock-file --uuid <cdrUuid> --out ./out.bin --listing-id <id>
linestack vaultline list
```

Options:

- `register-ip`: `--description`, `--license non-commercial|commercial-use|commercial-remix`, `--price-ip`
- `upload-file`: `--license-gated`, `--ip-id`
- `unlock-file`: `--listing-id` or `--ip-id`

### Queryline

```bash
linestack queryline create-dataset --name patients
linestack queryline seed --dataset-id <id> --file ./dataset.json
linestack queryline add-template --dataset-id <id> --name avg_value_by_region
linestack queryline request-query --dataset-id <id> --template-id <tid> --params '{"region":"EU"}'
linestack queryline fulfill --request-id <rid>
linestack queryline unlock-result --request-id <rid>
linestack queryline list
```

Sample `dataset.json`:

```json
{
  "rows": [{ "region": "EU", "value": 42 }, { "region": "US", "value": 37 }]
}
```

---

## MCP tools (1:1 with CLI)

| MCP tool | CLI |
|----------|-----|
| `linestack_status` | `status` |
| `registry_refresh` | `registry-refresh` |
| `vaultline_create_vault` | `vaultline create-vault` |
| `vaultline_write_secret` | `vaultline write-secret` |
| `vaultline_read_secret` | `vaultline read-secret` |
| `vaultline_upload_file` | `vaultline upload-file` |
| `vaultline_unlock_file` | `vaultline unlock-file` |
| `vaultline_register_ip` | `vaultline register-ip` |
| `vaultline_buy_license` | `vaultline buy-license` |
| `vaultline_list` | `vaultline list` |
| `queryline_create_dataset` | `queryline create-dataset` |
| `queryline_seed_dataset` | `queryline seed` |
| `queryline_add_template` | `queryline add-template` |
| `queryline_request_query` | `queryline request-query` |
| `queryline_execute_query` | `queryline fulfill` |
| `queryline_unlock_result` | `queryline unlock-result` |
| `queryline_list` | `queryline list` |

Config templates: [docs/config/](./config/).

---

## SDK (`LineStack` class)

```typescript
import { loadLineStackEnv, LineStack } from "@line-stack/sdk";

loadLineStackEnv();
const ls = new LineStack();
await ls.connect();
await ls.refreshRegistry();

await ls.vaultlineCreateVault("demo");
await ls.querylineCreateDataset("patients", "{}", "");
await ls.querylineFulfillRequest(requestId);
```

Methods mirror CLI/MCP: `vaultline*` and `queryline*` on [packages/sdk/src/linestack.ts](../packages/sdk/src/linestack.ts).

---

## Queryline honesty

Fulfillment is **publisher-side**: decrypt dataset vault → run allow-listed template → write result vault → EIP-712 binding → Automata `verifyAndAttestOnChain`. CDR SDK 0.2.1 has no enclave execute API. See [QUERYLINE.md](./QUERYLINE.md).

---

## Smoke tests

```bash
npm run test:e2e              # Vaultline + Queryline (two wallets)
npm run test:e2e:queryline      # Queryline only
npm run test:e2e:automata       # Queryline + Automata DCAP
npm run demo:automata           # Standalone Automata tx
```

---

## `@line-stack/cdr-core`

Lower-level CDR + Aeneid + registry + attestation. Used by the web app and SDK. Browser-safe subpath: `@line-stack/cdr-core/attestation/browser`.
