# Clearance402 — Gamma pitch deck input

Use this file when building your deck in [Gamma](https://gamma.app). Paste sections into Gamma’s “Add script” / speaker notes fields.

**Pre-made images:** `public/media/pitch-slide-title.png`, `architecture.svg`, `og-banner.png`  
**Full media guide:** [MEDIA-PRODUCTION.md](./MEDIA-PRODUCTION.md)

---

## One-liner

**Before your agent pays, it gets clearance.**

Clearance402 is the trust layer for x402 and MCP agent payments on **Base Sepolia** — probe tools, score output, enforce ERC-7715 permissions, and pay only if cleared.

---

## Problem (slide 2)

- Agents can pay for APIs via x402, but **nothing tells them if a tool is safe**
- Price mismatch, bad output, and permission overreach cause **silent losses**
- Venice and other inference APIs need **wallet or API-key setup** — judges and builders need a repeatable demo path

---

## Solution (slide 3)

Clearance402 sits **between the agent and the paid tool**:

1. **Probe** — real HTTP 402 → USDC settle → response (Base Sepolia)
2. **Evaluate** — Venice API when credits exist; **local heuristic** when they don’t
3. **Check** — ALLOW / WARN / BLOCK before payment
4. **Pay-if-cleared** — ERC-7715 session + server-side x402 execution
5. **Audit** — every probe, payment, block, and permission event

---

## How it works (slide 4 — architecture)

```
User wallet (MetaMask)
    → Clearance402 dashboard + APIs
        → Probe wallet (server) tests x402 endpoints
        → Venice eval (API key) or heuristic fallback
        → Permission store (ERC-7715 mandates)
        → Agent clearance check
        → Pay-if-cleared (x402 @x402/fetch)
    → Postgres (Vercel) per-wallet persistence
```

**Built-in free demo:** `GET /api/demo/x402` — no Venice credits required.

**Venice path:** `POST /api/v1/chat/completions` — judges add `VENICE_API_KEY` in `.env.local`.

---

## Traction / demo proof (slide 5)

- Live app: https://clearancex402.vercel.app
- **18+ automated smoke checks** (API, SDK, CLI, MCP)
- npm packages: `@clearance402/sdk`, `@clearance402/cli`, `@clearance402/mcp-server`
- Hackathon tracks: x402 + ERC-7710, Best Agent, A2A, Venice AI

---

## Business / why now (slide 6)

- x402 is the **HTTP-native payment standard** for agents (Linux Foundation)
- MetaMask Smart Accounts + ERC-7715 enable **delegated spend with caps**
- Trust layer is the missing **middleware** every agent marketplace will need

---

## Ask / close (slide 7)

- Try the demo: connect wallet → Payment Lab → Agent Clearance
- Judges: clone repo, copy `.env.vercel.import` → `.env.local`, add `VENICE_API_KEY`, run `npm run smoke`
- Contact: henrysammarfo / clearancex402 on GitHub

---

# Pitch video script (~90 seconds)

**[0:00]** “Every week, AI agents pay for APIs they’ve never verified. One bad endpoint drains USDC in seconds.”

**[0:12]** “Clearance402 is the trust layer for agent payments. Before your agent pays, it gets clearance.”

**[0:22]** “On Base Sepolia, we run a live x402 probe: HTTP 402, USDC settlement, real response. No mocks.”

**[0:32]** “We score output with Venice when you have API credits — or a local heuristic when you don’t, so demos always work.”

**[0:42]** “Operators grant ERC-7715 permissions with caps and domain allowlists. Agents hit our check API and get ALLOW, WARN, or BLOCK — with reasons.”

**[0:55]** “Only cleared payments execute. Every step lands in an audit log. SDK, CLI, and MCP ship for agent hosts.”

**[1:05]** “Built for the MetaMask × 1Shot × Venice cook-off. Live at clearancex402.vercel.app. Before your agent pays — clearance.”

---

# Demo video script (~3 minutes)

| Time | Screen | Action | Say |
|------|--------|--------|-----|
| 0:00 | Landing | Show logo + tagline | “Clearance402 — trust layer for x402 agent payments on Base Sepolia.” |
| 0:15 | Connect wallet | MetaMask Base Sepolia | “Your wallet is your account ID — data persists across devices.” |
| 0:30 | Dashboard | Trust stats | “Built-in tools include a free x402 demo and Venice chat.” |
| 0:45 | Payment Lab | Select **Clearance402 x402 Demo** → Run probe | “Watch 402 challenge, payment, and JSON response — no Venice spend.” |
| 1:15 | Venice eval | Select **Venice Chat** → Run eval | “With VENICE_API_KEY, Venice scores output; without credits, heuristic fallback runs.” |
| 1:35 | Permissions | Grant ERC-7715 mandate | “Cap per-call and daily spend; allowlisted domains.” |
| 1:55 | Agent clearance | Check → Pay if cleared | “Server runs clearance check then x402 pay from session key.” |
| 2:20 | Audit | Scroll events | “Every probe, payment, and permission is auditable.” |
| 2:35 | Terminal | `npm run cli -- tools list` | “Same APIs via CLI and MCP for autonomous agents.” |
| 2:50 | GitHub + Vercel | Show deploy | “Clone, import env template, run smoke — judges can verify in minutes.” |

---

# Gamma “deep load” bullets (paste into deck generator)

- Product name: **Clearance402**
- URL: https://clearancex402.vercel.app
- Repo: https://github.com/henrysammarfo/clearancex402
- Chain: Base Sepolia (84532)
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Free demo endpoint: `/api/demo/x402`
- Venice endpoint: `https://api.venice.ai/api/v1/chat/completions`
- Tracks: x402+ERC-7710, Best Agent, A2A, Venice AI
- npm: `@clearance402/sdk`, `@clearance402/cli`, `@clearance402/mcp-server`
