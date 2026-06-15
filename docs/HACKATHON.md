# Hackathon demo runbook

**Goal:** Live x402 probe + clearance flow in **2–3 minutes** for the submission video.

**Shot-by-shot script:** [DEMO-VIDEO.md](./DEMO-VIDEO.md)  
**Images + pitch video:** [MEDIA-PRODUCTION.md](./MEDIA-PRODUCTION.md)  
**Form answers:** [HACKATHON-SUBMISSION.md](./HACKATHON-SUBMISSION.md)  
**Gamma deck input:** [GAMMA-PITCH.md](./GAMMA-PITCH.md)

## Before you record

```powershell
node scripts/smoke-clearance402.mjs https://clearancex402.vercel.app
```

Production must show **22/22** and `/api/clearance/status` → `databaseConfigured: true`.

Wallet: MetaMask on **Base Sepolia (84532)**.

## Web demo (video — follow DEMO-VIDEO.md)

| Act | Time | Route |
|-----|------|--------|
| Hook + status | 0:00–0:22 | `/` → `/status` |
| x402 probe | 0:35–1:15 | `/payment-lab` → x402 demo |
| Venice eval | 1:20–1:40 | `/venice-eval` |
| Permissions + clearance | 1:40–2:15 | `/permissions` → `/agent-clearance` |
| Audit + agents | 2:15–2:55 | `/audit` → CLI → `/mcp` |

## Agent demo (Cursor / MCP)

```bash
npm run build:packages
CLEARANCE402_API_URL=https://clearancex402.vercel.app npx -y @clearance402/mcp-server
```

Or CLI: `npm run cli -- status` → `tools list` → probe.

## Talking points

- **x402** — real 402 challenge and USDC on Sepolia (not mocked)
- **Venice** — API scoring + heuristic fallback for judge-friendly demos
- **ERC-7715** — spend caps and allowlists before pay-if-cleared
- **Agents** — SDK + CLI + MCP parity with web app

## npm publish (maintainer)

[NPM-PUBLISH-COMMANDS.md](./NPM-PUBLISH-COMMANDS.md)

## If live fails

```powershell
node scripts/smoke-clearance402.mjs https://clearancex402.vercel.app
```

Check Vercel env: Postgres (`STORAGE_*` or `POSTGRES_URL`), `WALLET_PRIVATE_KEY`, `SESSION_ENCRYPTION_SECRET`.
