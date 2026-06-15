# Demo video — 2–3 minutes (submission)

**Target length:** 2:30–3:00 · **Format:** screen recording + voiceover · **Upload:** YouTube (unlisted) → paste link in hackathon form

**Live app:** https://clearancex402.vercel.app

**Pitch script (90s, separate video):** [GAMMA-PITCH.md](./GAMMA-PITCH.md#pitch-video-script-90-seconds)

---

## Pre-flight (before Record)

- [ ] Production healthy: `node scripts/smoke-clearance402.mjs https://clearancex402.vercel.app` → **22/22**
- [ ] MetaMask on **Base Sepolia (84532)** with a little ETH + USDC (for live probe if shown)
- [ ] Browser zoom **110%**; hide bookmarks bar; close extra tabs
- [ ] Optional second window: terminal for CLI (`npm run cli -- status`)
- [ ] Mic test; use OBS, Loom, or Windows Game Bar (Win+G)

**Wallet note:** Connect the same wallet you used in smoke tests. Data persists in Postgres per wallet.

---

## Shot list (demo video — show, don't tell)

| Time | Route / screen | Action | Say (voiceover) |
|------|----------------|--------|----------------|
| **0:00–0:12** | `/` landing | Pan hero + tagline | “Clearance402 is the trust layer for x402 agent payments on Base Sepolia. Before your agent pays, it gets clearance.” |
| **0:12–0:22** | `/status` | Show green chips: chain, db, venice, probe | “Production is live — Postgres persistence, probe wallet, and Venice eval configured.” |
| **0:22–0:35** | Connect wallet | MetaMask → Base Sepolia | “Your wallet is your account ID. Probes, permissions, and audit events persist across devices.” |
| **0:35–0:45** | `/dashboard` | Trust stats overview | “Built-in tools include a free x402 demo and Venice chat — no mocks.” |
| **0:45–1:15** | `/payment-lab` | Select **Clearance402 x402 Demo** → **Run probe** | “Watch a real HTTP 402 challenge, USDC settlement, and JSON response. This uses our free `/api/demo/x402` endpoint — no Venice credits needed.” |
| **1:15–1:20** | Probe result panel | Highlight `paid: true`, latency, trust score | “Probe wallet pays on Sepolia; trust score and ALLOW state update immediately.” |
| **1:20–1:40** | `/venice-eval` or Payment Lab | Select **Venice Chat** → Run eval | “With `VENICE_API_KEY`, Venice scores output quality. Without credits, our heuristic fallback still runs — demos always work.” |
| **1:40–1:55** | `/permissions` | Grant mandate (cap + domain) | “Operators set ERC-7715-style spend caps and domain allowlists before agents can pay.” |
| **1:55–2:15** | `/agent-clearance` | Run **Check** → **Pay if cleared** | “Agents call check first — ALLOW, WARN, or BLOCK with reasons. Only cleared payments execute server-side via x402.” |
| **2:15–2:30** | `/audit` | Scroll recent events | “Every probe, payment, permission grant, and block is auditable.” |
| **2:30–2:45** | Terminal | `npm run cli -- tools list` | “Same APIs ship as SDK, CLI, and MCP — agents can clear payments autonomously.” |
| **2:45–2:55** | `/mcp` or `/sdk` | Quick scroll tool grid | “Drop `@clearance402/mcp-server` into Cursor or Claude Desktop.” |
| **2:55–3:00** | End card | Logo + URLs | “clearancex402.vercel.app · github.com/henrysammarfo/clearancex402” |

---

## Screenshots for pitch deck (capture yourself)

Save PNGs to `docs/media/` (or drag into Gamma):

| File | Page | What to show |
|------|------|----------------|
| `01-landing.png` | `/` | Hero headline |
| `02-dashboard.png` | `/dashboard` | Stats + recent activity |
| `03-payment-lab-probe.png` | `/payment-lab` | x402 demo probe result (`paid: true`) |
| `04-venice-eval.png` | `/venice-eval` | Eval result + `source: heuristic` or `venice` |
| `05-permissions.png` | `/permissions` | Active mandate |
| `06-agent-clearance.png` | `/agent-clearance` | ALLOW decision |
| `07-audit.png` | `/audit` | Event list |
| `08-architecture.png` | — | Use `public/media/architecture.svg` export |

**Pre-made graphics:** `public/media/og-banner.png`, `pitch-slide-title.png`, `demo-thumbnail.png`, `architecture.svg`

---

## B-roll (if something is slow)

- While probe runs: cut to **Base Sepolia explorer** with USDC transfer
- While check runs: split **Agent clearance** + **Network tab** showing `/api/clearance/check` JSON

---

## Do say

- “Real x402 on Base Sepolia — 402 challenge, USDC payment, verified response”
- “Venice when you have credits; heuristic fallback when you don’t”
- “ERC-7715 permissions with spend caps before pay-if-cleared”
- “22 automated smoke checks — API, SDK, CLI, MCP”

## Do not say

- “Fully trustless” (say **auditable** + **permission-gated**)
- “Mock payment” (everything is live on Sepolia for the demo tool)

---

## After upload

1. Paste YouTube URL in [HACKATHON-SUBMISSION.md](./HACKATHON-SUBMISSION.md)
2. Post Discord copy from [DISCORD-SUBMISSION.md](./DISCORD-SUBMISSION.md)
3. Attach Gamma deck link if the form asks for slides
