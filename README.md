# Clearance402

**Before your agent pays, it gets clearance.**

Clearance402 is the trust, testing, onboarding, and safety layer for **x402 / MCP agent payments** on **Base Sepolia**. x402 lets agents pay — Clearance402 tells them what is *safe* to pay for.

Built for the [MetaMask Smart Accounts Kit × 1Shot × Venice AI Dev Cook Off](https://hackquest.io/hackathons/MetaMask-Smart-Accounts-Kit-x-1Shot-API-x-Venice-AI-Dev-Cook-Off).

---

## Quick start

```bash
cp .env.example .env.local   # add WALLET_PRIVATE_KEY + optional VENICE_API_KEY
npm install
npm run dev                  # http://localhost:8080
```

Connect MetaMask on **Base Sepolia (84532)**. Fund the probe wallet with ETH + test USDC ([Circle faucet](https://faucet.circle.com/)).

---

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_BASE_SEPOLIA_RPC_URL` | Browser RPC (default: `https://sepolia.base.org`) |
| `VITE_CLEARANCE_CHAIN_ID` | `84532` |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect modal (optional) |
| `WALLET_PRIVATE_KEY` | **Server only** — x402 probe buyer wallet |
| `VENICE_API_KEY` | **Server only** — output evaluation (heuristic fallback if unset) |

---

## Demo flow (3 min)

1. **Permissions** — Grant buyer-agent spend cap via MetaMask signature (ERC-7715-style)
2. **Payment lab** — Live x402 probe on Venice Vision (`402 → pay → response`)
3. **Venice eval** — Output quality + drift scoring
4. **Agent clearance** — `ALLOW` / `BLOCK` before payment
5. **A2A lab** — Scout → Verifier → Guardian redelegation → Buyer
6. **Audit** — Real probe, payment, permission, and Venice events

---

## API routes

| Route | Purpose |
|-------|---------|
| `POST /api/clearance/probe` | Live x402 probe |
| `POST /api/clearance/check` | Agent clearance decision |
| `POST /api/clearance/venice-eval` | Venice output eval |
| `GET/POST/DELETE /api/clearance/permissions` | Spend mandates |
| `POST /api/clearance/a2a` | Multi-agent coordination |
| `GET /api/clearance/audit` | Audit log |

---

## MCP

```bash
npm run build:mcp
CLEARANCE402_API_URL=http://localhost:8080 npm run mcp
```

Tools: `clearance402_probe_endpoint`, `clearance402_check_payment`, `clearance402_get_audit_log`

See [AGENTS.md](./AGENTS.md).

---

## Hackathon tracks

- Best x402 + ERC-7710
- Best Agent
- Best A2A Coordination
- Best Venice AI

**Note:** 1Shot Relayer prize requires mainnet — this build targets **Base Sepolia testnet only**.

---

## Project structure

```
src/
  routes/           Console + API routes
  lib/clearance/    probe, check, venice, store, x402 client
packages/
  clearance402-mcp/ MCP server for agents
```
