# MCP config templates

Copy the JSON block into your agent host. **Do not** put `WALLET_PRIVATE_KEY` in these files — use `LINESTACK_ENV_FILE` pointing at `~/.linestack/.env`.

| File | Use when |
|------|----------|
| [cursor-mcp.json](./cursor-mcp.json) | Cursor (project `.cursor/mcp.json` or Settings → MCP) |
| [claude-desktop-mcp.json](./claude-desktop-mcp.json) | Claude Desktop `claude_desktop_config.json` |
| [mcp-monorepo.json](./mcp-monorepo.json) | Local dev before `@line-stack/mcp-server` is on npm |

Replace `LINESTACK_ENV_FILE` with your absolute path to `.env`.
