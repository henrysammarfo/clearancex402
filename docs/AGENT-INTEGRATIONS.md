# Agent integrations — Cursor, Claude, ChatGPT, Gemini, and more

Line Stack exposes **Vaultline** and **Queryline** to agents through:

| Surface | Package / command | Best for |
|---------|-------------------|----------|
| **MCP (stdio)** | `@line-stack/mcp-server` | Cursor, Claude Desktop, Claude Code, Windsurf, Cline, Zed (MCP hosts) |
| **CLI** | `@line-stack/cli` → `linestack` | ChatGPT Code Interpreter, Gemini CLI, any shell agent |
| **SDK** | `@line-stack/sdk` | Custom Node backends, scripts, wrappers |

All three use the **same** `~/.linestack/.env`, **same VPS registry** as [linestack.vercel.app](https://linestack.vercel.app), and **real** Story Aeneid + CDR transactions.

Web reference: [/mcp](https://linestack.vercel.app/mcp) · [/agent-runbook](https://linestack.vercel.app/agent-runbook)

---

## 1. One-time setup (every host)

### 1.1 Create config file

```bash
mkdir -p ~/.linestack
cp .linestack.env.example ~/.linestack/.env
# Edit secrets — chmod 600 on Mac/Linux
```

Copy from repo root after clone, or from [`.linestack.env.example`](../.linestack.env.example).

### 1.2 Required variables

| Variable | Required for |
|----------|----------------|
| `WALLET_PRIVATE_KEY` | All signed flows |
| `STORY_RPC_URL` | Chain (default Aeneid OK) |
| `IPFS_PROXY_URL` + `IPFS_PROXY_SECRET` | File upload/unlock |
| `REGISTRY_API_URL` + `REGISTRY_PROXY_SECRET` | Shared marketplace state |
| `LINESTACK_*` (4 addresses) | On-chain dataset/template + conditions |
| `STORACHA_PROOF` | `vaultline register-ip` / `vaultline_register_ip` only |
| `USE_AUTOMATA_DCAP_FIXTURE=1` **or** `AUTOMATA_DCAP_QUOTE_HEX` | `queryline fulfill` / `queryline_execute_query` |

Contract addresses: `contracts/deployed.aeneid.json`.

### 1.3 Install packages (after npm publish)

```bash
npm install -g @line-stack/cli @line-stack/mcp-server
npm install @line-stack/sdk
```

**Before publish** (monorepo):

```bash
npm run build:packages
npm run linestack -- status
npm run linestack:mcp
```

### 1.4 Verify

```bash
linestack status
linestack registry-refresh
```

Expect registry + IPFS reachable and wallet address on chain **1315**.

---

## 2. MCP hosts (Cursor, Claude Desktop / Code, etc.)

MCP runs `@line-stack/mcp-server` as a **stdio** subprocess. Secrets stay in `LINESTACK_ENV_FILE`, not in the JSON config.

### 2.1 Published package (recommended)

Copy [docs/config/cursor-mcp.json](./config/cursor-mcp.json) or:

```json
{
  "mcpServers": {
    "linestack": {
      "command": "npx",
      "args": ["-y", "@line-stack/mcp-server"],
      "env": {
        "LINESTACK_ENV_FILE": "C:/Users/YOU/.linestack/.env"
      }
    }
  }
}
```

Use your real path to `.env` (Windows or Unix).

### 2.2 Monorepo / pre-publish

[docs/config/mcp-monorepo.json](./config/mcp-monorepo.json) — points at `packages/mcp-server/dist/index.js` after `npm run build:mcp`.

### 2.3 Where to paste config

| Host | Config location |
|------|-----------------|
| **Cursor** | Project `.cursor/mcp.json` or **Settings → MCP** |
| **Claude Desktop** | `%APPDATA%\Claude\claude_desktop_config.json` (Windows) · `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) |
| **Claude Code** | `~/.claude.json` → `mcpServers` (or project MCP settings) |
| **Windsurf / Cline** | IDE MCP settings (same JSON shape) |

Restart the host after saving. In chat, ask: *“Call linestack_status”* to confirm tools load.

### 2.4 MCP tool catalog

| Tool | CLI equivalent |
|------|----------------|
| `linestack_status` | `linestack status` |
| `registry_refresh` | `linestack registry-refresh` |
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

**Honest naming:** `queryline_execute_query` = **publisher fulfill** (CDR decrypt → allow-listed template → result vault + EIP-712 + Automata). Not Story enclave `executeQuery`.

Full I/O shapes: [packages/mcp-server/README.md](../packages/mcp-server/README.md) · web [/mcp](https://linestack.vercel.app/mcp).

---

## 3. ChatGPT

ChatGPT does **not** run local stdio MCP in the browser. Use one of:

### Option A — CLI in Advanced Data Analysis / shell (Plus)

If the session can run shell with Node:

```bash
npm install -g @line-stack/cli
export LINESTACK_ENV_FILE=~/.linestack/.env
linestack status
linestack vaultline list
```

Paste **tx hashes** and JSON output back into the thread.

### Option B — Custom GPT + Actions (OpenAPI)

Expose a small **HTTPS** wrapper you host (optional future). Today: document flows in GPT **Instructions** linking to this repo and `linestack` commands.

### Option C — Desktop / API with tools

OpenAI **Agents SDK** / Responses API: register functions that shell out to `linestack` or import `@line-stack/sdk`.

**Suggested GPT instructions snippet:**

> Line Stack on Story Aeneid (1315). Use `linestack` CLI with `LINESTACK_ENV_FILE`. Vaultline = licensed files; Queryline = publisher fulfill via `queryline fulfill`. Never invent tx hashes.

---

## 4. Google Gemini

### Gemini CLI / Antigravity (terminal)

Same as CLI:

```bash
npm install -g @line-stack/cli
linestack status
```

Point `LINESTACK_ENV_FILE` at `~/.linestack/.env`.

### Gemini API (code execution)

```typescript
import { loadLineStackEnv, LineStack } from "@line-stack/sdk";
loadLineStackEnv();
const ls = new LineStack();
await ls.connect();
```

Run in a Node Cloud Function or local script; return JSON to the model.

### Gemini Extensions

No first-party Line Stack extension. Use **function calling** with your SDK wrapper or subprocess to `linestack`.

---

## 5. SDK (custom agents & backends)

```typescript
import { loadLineStackEnv, LineStack } from "@line-stack/sdk";

loadLineStackEnv(); // ~/.linestack/.env by default
const ls = new LineStack();
await ls.connect();
await ls.refreshRegistry();

const { vaultId, cdrUuid, txHash } = await ls.vaultlineCreateVault("agent-demo");
const { requestId } = await ls.querylineRequestQuery(datasetId, templateId, { region: "EU" });
await ls.querylineFulfillRequest(requestId); // publisher wallet
```

API reference: [packages/sdk/README.md](../packages/sdk/README.md) · [SDK-CLI-MCP.md](./SDK-CLI-MCP.md).

---

## 6. Two-wallet testing

| Role | Steps |
|------|--------|
| **Publisher** | create vault/dataset, upload/seed, register IP/template, fulfill |
| **Buyer** | buy license, request query, unlock file/result |

Use two keys: `WALLET_PRIVATE_KEY` + `BUYER_WALLET_PRIVATE_KEY` in `.env` for `npm run test:e2e`, or swap wallet in the agent host between steps.

---

## 7. Automata (Queryline fulfill)

| Env | Behavior |
|-----|----------|
| `USE_AUTOMATA_DCAP_FIXTURE=1` | Intel DCAP V5 fixture — **real** on-chain `verifyAndAttestOnChain` tx |
| `AUTOMATA_DCAP_QUOTE_HEX=0x…` | Your TEE quote (see [TEE-AUTOMATA-QUOTE.md](./TEE-AUTOMATA-QUOTE.md)) |

Web fulfill reads quote from Vercel `/api/automata/quote`. MCP/CLI read quote from **local env** only.

---

## 8. Skills (mandatory for this repo)

| Skill | Invoke | Purpose |
|-------|--------|---------|
| `linestack-agent-setup` | `/linestack-agent-setup` | Env + MCP config |
| `linestack-cdr-demo` | `/linestack-cdr-demo` | 2–3 min hackathon flow |

Locations: `.cursor/skills/`, `.agents/skills/`, `.codex/skills/` (same content).  
Also read root [AGENTS.md](../AGENTS.md) and [CLAUDE.md](../CLAUDE.md).

Setup helper: `npm run setup:agents`

## 9. Publish to npm

See [NPM-PUBLISH-COMMANDS.md](./NPM-PUBLISH-COMMANDS.md) and [PUBLISHING.md](./PUBLISHING.md).

**Security:** Never paste npm tokens into chat. Run `npm login` and `npm run publish:packages` locally only.

After publish, MCP uses `npx -y @line-stack/mcp-server` ([docs/config/cursor-mcp.json](./config/cursor-mcp.json)).

## 10. A2A (agent-to-agent protocol)

**Not required.** See [A2A.md](./A2A.md). Line Stack is MCP/CLI agent-ready; Story’s A2A negotiate demo is a separate protocol.

---

## 11. Troubleshooting

| Symptom | Fix |
|---------|-----|
| MCP server not listed | Restart host; check JSON syntax; run `npx -y @line-stack/mcp-server` manually |
| `WALLET_PRIVATE_KEY` missing | Set `LINESTACK_ENV_FILE` path correctly |
| Listing not found | `registry_refresh`; use production registry URL |
| Fulfill fails Automata | Add `USE_AUTOMATA_DCAP_FIXTURE=1` to `~/.linestack/.env` |
| `register-ip` fails | Set `STORACHA_PROOF` |
| Wrong chain | Wallet on Story Aeneid **1315** |

---

## 12. Related docs

- [SDK-CLI-MCP.md](./SDK-CLI-MCP.md) — CLI flags & env
- [PUBLISHING.md](./PUBLISHING.md) — npm release
- [BETA-ONBOARDING.md](./BETA-ONBOARDING.md) — human testers
- [QUERYLINE.md](./QUERYLINE.md) — fulfill model
- [TEE-AUTOMATA-QUOTE.md](./TEE-AUTOMATA-QUOTE.md) — your own TEE quote
