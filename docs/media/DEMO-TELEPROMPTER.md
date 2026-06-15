# Demo video — teleprompter script (your voice)

**Length:** ~2:30–3:00 · **Record:** screen + mic together (OBS, Loom, or Win+G)  
**App:** https://clearancex402.vercel.app · Wallet on **Base Sepolia**, connected before you hit Record

---

## Before you hit Record

- [ ] `node scripts/smoke-clearance402.mjs https://clearancex402.vercel.app` → 22/22
- [ ] MetaMask unlocked, **Base Sepolia**, wallet connected on the site
- [ ] Browser zoom **110%**, bookmarks bar hidden, extra tabs closed
- [ ] Open these tabs **in order** (left to right):
  1. https://clearancex402.vercel.app/
  2. https://clearancex402.vercel.app/status
  3. https://clearancex402.vercel.app/dashboard
  4. https://clearancex402.vercel.app/payment-lab
  5. https://clearancex402.vercel.app/venice-eval
  6. https://clearancex402.vercel.app/permissions
  7. https://clearancex402.vercel.app/agent-clearance
  8. https://clearancex402.vercel.app/audit
  9. https://clearancex402.vercel.app/mcp
- [ ] Optional: terminal open in repo folder for CLI line at the end
- [ ] Mic test — quiet room, speak at normal pace

---

## SCRIPT — copy each block as you go

---

### BEAT 1 — Landing (0:00–0:15)

**DO:** Tab 1 — landing page. Mouse slowly over hero headline.

**SAY:**

```
Hi — this is Clearance402.

It's the trust layer for x402 agent payments on Base Sepolia.

The idea is simple: before your agent pays for an API, it gets clearance.
```

---

### BEAT 2 — Status (0:15–0:28)

**DO:** Tab 2 — `/status`. Point at green chips: chain, database, Venice, probe wallet.

**SAY:**

```
This is live in production on Vercel.

Postgres persistence is on, the probe wallet is configured, and Venice eval is ready.

Everything you see here is real — not mocked.
```

---

### BEAT 3 — Wallet (0:28–0:38)

**DO:** Click wallet address in header (or show connected state on dashboard tab).

**SAY:**

```
Your MetaMask wallet is your account ID.

Probes, permissions, and audit events persist server-side — same wallet on any device.
```

---

### BEAT 4 — Dashboard (0:38–0:48)

**DO:** Tab 3 — `/dashboard`. Brief pause on stats / recent activity.

**SAY:**

```
The dashboard shows your trust stats and recent clearance activity.

Built-in tools include a free x402 demo and Venice chat — no setup required to try the probe flow.
```

---

### BEAT 5 — Payment Lab / x402 probe (0:48–1:20)

**DO:** Tab 4 — `/payment-lab`.
1. Tool dropdown → **Clearance402 x402 Demo**
2. Click **Run probe**
3. Wait for result — point at **paid true**, latency, trust score

**SAY:**

```
Payment Lab runs a live x402 probe on Base Sepolia.

I'll select the built-in Clearance402 x402 demo and hit Run probe.

Watch what happens: HTTP 402 challenge, USDC settlement on Sepolia, and a real JSON response back.

No Venice credits needed — this endpoint is free for judges and developers.

You can see payment succeeded, latency, and the trust score updated immediately.
```

---

### BEAT 6 — Venice eval (1:20–1:42)

**DO:** Tab 5 — `/venice-eval`.
1. Select **Venice Chat**
2. Click run eval (or equivalent button)
3. Point at result — `source: venice` or `source: heuristic`

**SAY:**

```
Next, output evaluation.

With a Venice API key, Venice scores the tool output for quality and risk.

If credits are exhausted, our heuristic fallback still runs — so demos always work in hackathon judging.
```

---

### BEAT 7 — Permissions (1:42–1:55)

**DO:** Tab 6 — `/permissions`.
1. Agent ID: **buyer-agent** (must match agent-clearance page)
2. Allowed domains must include: **clearancex402.vercel.app, api.venice.ai, venice.ai**
3. Click **Grant via Smart Accounts Kit** → approve MetaMask
4. Confirm active permission shows those domains

**SAY:**

```
Operators grant ERC-7715-style permissions with per-call caps, daily limits, and domain allowlists.

Agents cannot pay outside what the user approved.
```

---

### BEAT 8 — Agent clearance (1:55–2:20)

**DO:** Tab 7 — `/agent-clearance`.
1. Confirm tool = **Clearance402 x402 Demo** (or x402-sepolia-demo)
2. Click **Run clearance check** (or Check)
3. Show **ALLOW** badge + reasons
4. If visible, click **Pay if cleared** and show success

**SAY:**

```
Agent clearance is the decision API.

The agent calls check first and gets ALLOW, WARN, or BLOCK — with reasons.

Only cleared payments execute. The server runs x402 pay-if-cleared from the session.

Here we get ALLOW — safe to pay.
```

---

### BEAT 9 — Audit log (2:20–2:32)

**DO:** Tab 8 — `/audit`. Slow scroll through recent events (probes, checks, payments).

**SAY:**

```
Every probe, clearance check, payment, and permission change is written to the audit log.

Full traceability for operators and judges.
```

---

### BEAT 10 — CLI / MCP (2:32–2:48)

**DO:** Switch to terminal OR tab 9 `/mcp`.

**Terminal — paste and run:**
```
npm run cli -- tools list
```

**Or on /mcp:** scroll the tool grid.

**SAY:**

```
Same APIs ship for autonomous agents.

CLI and MCP expose list tools, run probes, clearance check, and pay-if-cleared — parity with the web app.

Drop the MCP server into Cursor or Claude Desktop and agents can clear payments on their own.
```

---

### BEAT 11 — Close (2:48–3:00)

**DO:** Tab 1 landing again, or show end card / `public/media/demo-thumbnail.png` in editor.

**SAY:**

```
Clearance402 — before your agent pays, it gets clearance.

Live at clearancex402.vercel.app.

Repo on GitHub: henrysammarfo slash clearancex402.

Clone it, run the smoke tests, and verify in minutes. Thanks for watching.
```

---

## If something breaks while recording

| Problem | Say this instead | Show |
|---------|------------------|------|
| Probe slow | "Settling USDC on Sepolia…" | Wait or cut in edit |
| Probe fails | Skip beat 5, say "Probe wallet funds Sepolia USDC live in production" | `/status` |
| Pay if cleared greyed out | Stop at ALLOW on beat 8 | ALLOW badge only |
| CLI not installed | Skip terminal | `/mcp` page only |

---

## After recording

1. Trim dead air in CapCut / DaVinci (optional)
2. Export **1080p 16:9**
3. YouTube → **Unlisted**
4. Thumbnail: `public/media/demo-thumbnail.png`
5. Paste URL in [HACKATHON-SUBMISSION.md](./HACKATHON-SUBMISSION.md)

---

## One-page paste (read straight through — advanced)

Use only if you're comfortable switching tabs without stopping.

```
Hi — this is Clearance402, the trust layer for x402 agent payments on Base Sepolia. Before your agent pays, it gets clearance.

Production is live on Vercel — Postgres, probe wallet, Venice eval, all configured. Your wallet is your account ID; data persists across devices.

In Payment Lab I run a live x402 probe — real 402, USDC on Sepolia, JSON back. No Venice credits needed for this demo tool.

Venice scores output when you have API credits; heuristic fallback when you don't.

Operators set ERC-7715 spend caps and domain allowlists. Agents call check — ALLOW, WARN, or BLOCK — then pay only if cleared.

Every action hits the audit log. Same APIs in SDK, CLI, and MCP for autonomous agents.

clearancex402.vercel.app — github.com/henrysammarfo/clearancex402. Thanks for watching.
```
