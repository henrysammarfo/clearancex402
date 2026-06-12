# Clearance402

**Before your agent pays, it gets clearance.**

Clearance402 is the live trust, testing, onboarding, and safety layer for **x402 / MCP agent payments**. x402 lets agents pay — Clearance402 tells them what is *safe* to pay for. It verifies paid tools in real time (live probes, price checks, output verification, risk scoring) before delegated wallet permissions are ever spent.

| Surface | Who it's for | What they get |
|---------|--------------|---------------|
| **Console** (web) | Operators & users | Trust Cards, payment checks, audit log, spend-mandate controls |
| **SDK** | Developers | Clear a payment in code: `ALLOW / WARN / BLOCK / RETEST / HUMAN_APPROVAL_REQUIRED` |
| **CLI** | Developers | The same checks from your terminal, plus audit export |
| **Agent tools (MCP)** | Cursor / Claude / any agent host | Verify tools and clear payments from inside the agent |

---

## Quick start (clone & run)

```bash
# 1. Clone
git clone <your-repo-url> clearance402
cd clearance402

# 2. Configure environment
cp .env.example .env.local      # then fill in the values you need

# 3. Install dependencies (Node 22.x)
npm install

# 4. Start the app
npm run dev                     # http://localhost:8080
```

That's everything needed to run the **console** locally. The dev server hot-reloads on save.

> **Wallet modal:** set `VITE_WALLETCONNECT_PROJECT_ID` in `.env.local` (free from
> [WalletConnect Cloud](https://cloud.walletconnect.com)) to enable the full wallet picker.
> Without it, injected wallets (e.g. MetaMask) still work.

---

## Onboarding paths

The app ships a built-in **Get started** flow on the Docs, SDK, CLI, and Agent-tools pages with two calm tracks:

- **New to this (web2)** — read the overview, browse verified tools, watch a guided run. No wallet required.
- **Web3 builder** — connect a wallet, onboard your tool, wire the SDK/CLI/MCP into your agent.

---

## Environment variables

All variables live in [`.env.example`](.env.example) with inline notes. The essentials:

| Variable | Purpose |
|----------|---------|
| `VITE_STORY_RPC_URL` / `STORY_RPC_URL` | Network RPC endpoint |
| `VITE_STORY_CHAIN_ID` / `STORY_CHAIN_ID` | Chain id used for operator access |
| `VITE_STORY_API_URL` / `STORY_API_URL` | Verification API endpoint |
| `VITE_WALLETCONNECT_PROJECT_ID` | Full wallet modal (recommended) |
| `WALLET_PRIVATE_KEY` | **Server/CLI only** — never prefix with `VITE_`, never commit |

> 🔐 Secrets (`WALLET_PRIVATE_KEY`, proofs, API secrets) must never be exposed to the
> browser or committed. See [SECURITY.md](SECURITY.md).

---

## Project structure

```
src/
  routes/            file-based routes (TanStack Start)
    index.tsx        landing
    docs.tsx         docs (with Get started)
    sdk.tsx cli.tsx mcp.tsx   developer surfaces
    dashboard.tsx    operator console
    tools.*          tool registry + trust cards
    agent-clearance.tsx  agent onboarding + clearance
    audit.tsx settings.tsx ...
  components/
    layout/          SiteHeader, SiteFooter, shells
    wallet/          WalletConnect, ConnectDialog
    onboarding/      GetStarted (web2 / web3)
    docs/            DocsPage
    snippets/        CodeBlock
  lib/               connection, clearance, env, registry helpers
packages/            SDK / CLI / MCP / core workspaces
```

---

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the console at `http://localhost:8080` |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint the project |
| `npm run format` | Prettier format |

---

## Agent surfaces

Add the connector to any compatible agent host:

```json
{
  "mcpServers": {
    "clearance402": {
      "command": "npx",
      "args": ["-y", "@clearance402/mcp-server"],
      "env": { "CLEARANCE402_API_KEY": "sk_..." }
    }
  }
}
```

Set `CLEARANCE402_API_KEY` from **Settings → API key** in the console. Full reference lives on the in-app **/mcp**, **/sdk**, and **/cli** pages.

---

## Security

- Never put `WALLET_PRIVATE_KEY` or any secret in a `VITE_*` variable or in source control.
- Wallet connection is required for operator actions; read-only browsing stays open.
- See [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).
