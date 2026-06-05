# Line Stack — agent instructions

Confidential marketplace on **Story Aeneid (1315)**. Real CDR txs; shared registry on VPS; web app at https://linestack.vercel.app.

## Tools you can use

| Surface | Install | Config |
|---------|---------|--------|
| **MCP** | `npx -y @line-stack/mcp-server` | `LINESTACK_ENV_FILE=~/.linestack/.env` |
| **CLI** | `npm i -g @line-stack/cli` | same env file |
| **SDK** | `npm i @line-stack/sdk` | `loadLineStackEnv()` |

Setup: [docs/AGENT-INTEGRATIONS.md](docs/AGENT-INTEGRATIONS.md) · tool list: [/mcp](https://linestack.vercel.app/mcp).

**Skills (invoke in Cursor/Codex):** `/linestack-agent-setup` then `/linestack-cdr-demo` · Demo video script: [docs/DEMO-VIDEO.md](docs/DEMO-VIDEO.md).

## Workflows (MCP tool names)

**Vaultline:** `vaultline_create_vault` → `vaultline_upload_file` → `vaultline_register_ip` → (buyer) `vaultline_buy_license` → `vaultline_unlock_file`.

**Queryline:** `queryline_create_dataset` → `queryline_seed_dataset` → `queryline_add_template` → `queryline_request_query` → (publisher) `queryline_execute_query` → (buyer) `queryline_unlock_result`.

**Platform:** `linestack_status`, `registry_refresh`, `vaultline_list`, `queryline_list`.

## Rules

- Never invent tx hashes or CDR UUIDs — call tools and use returned JSON.
- `queryline_execute_query` = **publisher fulfill** (off-chain template + CDR + EIP-712 + Automata). Not enclave `executeQuery`.
- `vaultline_register_ip` needs `STORACHA_PROOF` in env.
- Queryline Automata needs `USE_AUTOMATA_DCAP_FIXTURE=1` or `AUTOMATA_DCAP_QUOTE_HEX` in env for MCP/CLI fulfill.
- Two wallets for buyer vs publisher when testing end-to-end.
- Never commit or log `WALLET_PRIVATE_KEY`.

## Repo dev (monorepo)

```bash
npm run build:packages
npm run linestack -- status
npm run linestack:mcp
```

Publish: [docs/PUBLISHING.md](docs/PUBLISHING.md) — maintainer runs `npm publish` locally; **do not** accept npm tokens in chat.
