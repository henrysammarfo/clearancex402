# Clearance402 — agent instructions

Trust layer for x402 / MCP agent payments on **Base Sepolia**. Before your agent pays, it gets clearance.

## API routes (local dev)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/clearance/status` | GET | Health + env flags |
| `/api/clearance/probe` | POST | Live x402 probe (402 → pay → response) |
| `/api/clearance/venice-eval` | POST | Venice output evaluation |
| `/api/clearance/check` | POST | Agent clearance decision |
| `/api/clearance/permissions` | GET/POST/DELETE | ERC-7715-style grants |
| `/api/clearance/a2a` | POST | Scout → Verifier → Guardian → Buyer |
| `/api/clearance/audit` | GET | Audit log |

## Env (`~/.clearance402/.env` or `.env.local`)

```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
WALLET_PRIVATE_KEY=0x...          # server probes only
VENICE_API_KEY=...                 # optional; heuristic fallback if unset
VITE_WALLETCONNECT_PROJECT_ID=...
```

## MCP

```bash
npm run build:mcp
npm run mcp
```

Tools: `clearance402_probe_endpoint`, `clearance402_check_payment`, `clearance402_get_audit_log`.

## Rules

- No fake tx hashes or payment receipts in demos.
- Never commit `WALLET_PRIVATE_KEY` or `VENICE_API_KEY`.
- Target chain: **Base Sepolia (84532)** only.
