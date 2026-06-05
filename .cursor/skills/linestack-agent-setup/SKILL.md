---
name: linestack-agent-setup
description: Configure Line Stack MCP, CLI, and ~/.linestack/.env for Story Aeneid. Use when first connecting Cursor, Claude, Codex, or Gemini to Vaultline and Queryline.
disable-model-invocation: true
---

# Line Stack — agent setup (mandatory before MCP tools)

## 1. Env file

```bash
mkdir -p ~/.linestack
cp .linestack.env.example ~/.linestack/.env
# Edit: WALLET_PRIVATE_KEY, IPFS_PROXY_*, REGISTRY_*, LINESTACK_*, STORACHA_PROOF, USE_AUTOMATA_DCAP_FIXTURE=1
```

Windows: `%USERPROFILE%\.linestack\.env`

## 2. Cursor MCP

Copy `.cursor/mcp.json.example` → `.cursor/mcp.json`. Set `LINESTACK_ENV_FILE` to your `.env` path. Reload Cursor → Settings → MCP → `linestack` green.

## 3. Claude Desktop

Merge [docs/config/claude-desktop-mcp.json](docs/config/claude-desktop-mcp.json) into `%APPDATA%\Claude\claude_desktop_config.json`. Quit and reopen Claude.

## 4. Verify

```bash
npm run build:packages
npm run linestack -- status
```

After npm publish:

```bash
npm install -g @line-stack/cli @line-stack/mcp-server
linestack status
```

## 5. Read next

- `AGENTS.md` (repo root) — tool names and rules
- `docs/AGENT-INTEGRATIONS.md` — all hosts
- `/linestack-cdr-demo` — record hackathon video
