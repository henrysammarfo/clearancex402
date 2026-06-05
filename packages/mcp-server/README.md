# @line-stack/mcp-server

[MCP](https://modelcontextprotocol.io/) stdio server for **Vaultline** and **Queryline** on Story Aeneid (CDR, real txs).

## Install

```bash
npm install -g @line-stack/mcp-server
# or: npx -y @line-stack/mcp-server
```

## Configure

```json
{
  "mcpServers": {
    "linestack": {
      "command": "npx",
      "args": ["-y", "@line-stack/mcp-server"],
      "env": {
        "LINESTACK_ENV_FILE": "/home/you/.linestack/.env"
      }
    }
  }
}
```

Create `~/.linestack/.env` from the repo [`.linestack.env.example`](../../.linestack.env.example).

**Hosts:** Cursor, Claude Desktop, Claude Code, Windsurf, Cline — see [docs/AGENT-INTEGRATIONS.md](../../docs/AGENT-INTEGRATIONS.md).

## Tools (17)

| Tool | Description |
|------|-------------|
| `linestack_status` | Wallet, RPC, registry, IPFS, contracts |
| `registry_refresh` | Reload VPS registry snapshot |
| `vaultline_create_vault` | New CDR vault |
| `vaultline_write_secret` | On-chain secret write |
| `vaultline_read_secret` | On-chain secret read |
| `vaultline_upload_file` | Encrypt + IPFS upload |
| `vaultline_unlock_file` | Decrypt to disk |
| `vaultline_register_ip` | Story IP + listing |
| `vaultline_buy_license` | Buyer license mint |
| `vaultline_list` | List vaults / files / listings |
| `queryline_create_dataset` | Dataset vault + registry |
| `queryline_seed_dataset` | JSON rows into dataset |
| `queryline_add_template` | Allow-listed template |
| `queryline_request_query` | Buyer request |
| `queryline_execute_query` | Publisher fulfill (+ Automata if env set) |
| `queryline_unlock_result` | Buyer result decrypt |
| `queryline_list` | List datasets / templates / requests |

## Security

Runs locally with your wallet key. Testnet only unless you accept mainnet risk. Never commit `WALLET_PRIVATE_KEY`.

## Links

- [SDK-CLI-MCP.md](../../docs/SDK-CLI-MCP.md)
- [SECURITY.md](../../SECURITY.md)
