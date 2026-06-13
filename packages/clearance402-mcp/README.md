# @clearance402/mcp-server

MCP server exposing 9 Clearance402 tools for agent hosts (Cursor, Claude Desktop, etc.).

```bash
npm install -g @clearance402/mcp-server
```

```json
{
  "mcpServers": {
    "clearance402": {
      "command": "npx",
      "args": ["-y", "@clearance402/mcp-server"],
      "env": {
        "CLEARANCE402_API_URL": "https://clearancex402.vercel.app",
        "CLEARANCE402_WALLET": "0xYourAddress"
      }
    }
  }
}
```

Tools: `clearance402_status`, `clearance402_list_tools`, `clearance402_probe_endpoint`, `clearance402_check_payment`, `clearance402_record_payment`, and more.
