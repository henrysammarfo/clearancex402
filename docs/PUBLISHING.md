# Publishing to npm (@line-stack)

Packages are **ready to publish** when `npm run verify:publish` passes. Web app (`linestack.vercel.app`) is the production gate for end users; npm is for **CLI / SDK / MCP** consumers.

## Packages

| npm name | Binary | Description |
|----------|--------|-------------|
| `@line-stack/cdr-core` | — | CDR + Aeneid + registry + attestation |
| `@line-stack/sdk` | — | `LineStack` Node API |
| `@line-stack/cli` | `linestack` | Terminal |
| `@line-stack/mcp-server` | `linestack-mcp` | MCP stdio server |

Root app **line-stack** stays private (Vercel only).

---

## Security — read first

- **Never** paste npm tokens, passwords, or 2FA codes into Cursor chat, issues, or the repo.
- **Never** ask an AI agent to publish with your token — run publish **on your machine** after `npm login`.
- Use [npm Automation tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens) scoped to **Publish** for `@line-stack` only if using CI later.
- Confirm tarballs contain no secrets: `npm pack` in each package and inspect.

---

## One-time: npm org `@line-stack`

1. Log in: `npm login` (2FA on your account is fine — you complete it locally).
2. Create org: https://www.npmjs.com/org/create → name **`line-stack`**.
3. Add your user as owner (or use user scope if you skip org — packages already use `"publishConfig": { "access": "public" }`).

---

## Version bump

Keep all four packages on the **same version** (currently `0.1.1` on disk; npm may still show `0.1.0` until you publish):

- `packages/cdr-core/package.json`
- `packages/sdk/package.json`
- `packages/cli/package.json`
- `packages/mcp-server/package.json`

---

## Build & verify

```bash
npm run build:packages
npm run verify:publish
```

Dry-run publish:

```bash
npm run publish:packages:dry-run
```

---

## Publish (you run this locally)

```bash
npm run publish:packages
```

Order (handled by script): `cdr-core` → `sdk` → `cli` → `mcp-server`.

---

## After publish — consumers

```bash
npm install -g @line-stack/cli @line-stack/mcp-server
npm install @line-stack/sdk @line-stack/cdr-core
```

```bash
mkdir -p ~/.linestack
# copy .linestack.env.example → ~/.linestack/.env
linestack status
```

### MCP (Cursor / Claude Desktop / Code)

See [docs/config/cursor-mcp.json](./config/cursor-mcp.json) and [AGENT-INTEGRATIONS.md](./AGENT-INTEGRATIONS.md).

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

### ChatGPT / Gemini

No stdio MCP — use **CLI** (`linestack …`) or **SDK** in a Node script. See [AGENT-INTEGRATIONS.md](./AGENT-INTEGRATIONS.md).

---

## Post-publish checklist

- [ ] `npm view @line-stack/cli version` returns the new version
- [ ] `npx -y @line-stack/mcp-server` starts (Ctrl+C to exit)
- [ ] `linestack status` with a fresh `~/.linestack/.env`
- [ ] Update README “install” links if version bumped
- [ ] Optional: `npm run test:e2e` against published packages (install globally, not `file:`)

---

## Safety checklist

- [ ] `npm run verify:publish` passes
- [ ] No `WALLET_PRIVATE_KEY` in any package tarball
- [ ] Integration smoke on testnet after install from npm
- [ ] MCP docs point to `@line-stack/mcp-server` (not `@line-stack/mcp`)
