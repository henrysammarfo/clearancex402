# Step 4 — Demo voiceover (ElevenLabs)

**Goal:** ~2:30 narration for your **demo video** (screen recording + these clips).  
**Same rules as pitch:** one clip per paste, Multilingual v2 or Turbo v2.5.

---

## Demo video workflow

| Phase | What |
|-------|------|
| **A** | Generate these 8 audio clips (this doc) |
| **B** | Screen-record the app **silent** (follow shot list below) |
| **C** | Edit: lay clips over screen recording in CapCut / DaVinci |
| **D** | Upload YouTube unlisted, thumbnail: `public/media/demo-thumbnail.png` |

---

## Pre-flight (before recording screen)

```powershell
node scripts/smoke-clearance402.mjs https://clearancex402.vercel.app
```

Must be **22/22**. Wallet on **Base Sepolia**, connected.

**Recording:** OBS, Loom, or **Win + G** (Xbox Game Bar) → Capture → **110% zoom**, hide bookmarks.

---

## ElevenLabs clips (8 total)

### Clip 1 — Intro (`demo-01-intro.mp3`)

```
Clearance402 is the trust layer for x402 agent payments on Base Sepolia.
Before your agent pays, it gets clearance.
```

### Clip 2 — Live production (`demo-02-status.mp3`)

```
Production is live on Vercel with Postgres persistence.
Probe wallet, Venice eval, and session encryption are all configured.
```

### Clip 3 — Wallet (`demo-03-wallet.mp3`)

```
Your wallet is your account ID.
Probes, permissions, and audit events persist across devices.
```

### Clip 4 — x402 probe (`demo-04-probe.mp3`)

```
In Payment Lab, we run a live x402 probe on Base Sepolia.
Real HTTP 402 challenge, USDC settlement, and JSON response.
No Venice credits required — this uses our free built-in demo endpoint.
```

### Clip 5 — Venice (`demo-05-venice.mp3`)

```
Venice scores output quality when API credits are available.
Without credits, our heuristic fallback still runs, so demos always work.
```

### Clip 6 — Permissions + clearance (`demo-06-clearance.mp3`)

```
Operators set spend caps and domain allowlists.
Agents call the clearance check and get ALLOW, WARN, or BLOCK with reasons.
Only cleared payments execute server-side via x402.
```

### Clip 7 — Audit + agents (`demo-07-audit.mp3`)

```
Every probe, payment, and permission lands in the audit log.
The same APIs ship as SDK, CLI, and MCP for autonomous agents.
```

### Clip 8 — Close (`demo-08-close.mp3`)

```
Try it at clearancex402 dot vercel dot app.
Clone the repo and run smoke tests in minutes.
```

---

## Screen recording shot list (record silent — match clips)

Open tabs in this order before you hit Record:

| Order | URL | Show on screen |
|-------|-----|----------------|
| 1 | `/` | Hero + tagline (clip 1) |
| 2 | `/status` | Green status chips (clip 2) |
| 3 | Header | Wallet connected (clip 3) |
| 4 | `/payment-lab` | x402 demo → Run probe → `paid: true` (clip 4) |
| 5 | `/venice-eval` | Venice Chat → Run eval → result (clip 5) |
| 6 | `/permissions` | Quick scroll active mandate (clip 6 part 1) |
| 7 | `/agent-clearance` | Check → ALLOW → Pay if cleared (clip 6 part 2) |
| 8 | `/audit` | Scroll events (clip 7 part 1) |
| 9 | Terminal | `npm run cli -- tools list` (clip 7 part 2) |
| 10 | `/mcp` | Tool grid (optional B-roll) |
| 11 | End | Logo or `demo-thumbnail.png` + URLs (clip 8) |

**Tab order tip:** Open all tabs first, then record switching between them — fewer dead moments.

---

## Edit timing (CapCut / DaVinci)

1. Import screen recording + 8 MP3s  
2. Place clip 1 at 0:00, clip 2 after clip 1 ends + **1s gap**, etc.  
3. Trim screen footage so the **action matches** what you're saying  
4. Export **1080p 16:9**  
5. YouTube → Unlisted → paste URL in [HACKATHON-SUBMISSION.md](../HACKATHON-SUBMISSION.md)

---

## Minimum viable demo (if short on time — ~2:00)

Only clips **1, 4, 6, 7, 8** + screen: landing → payment-lab probe → agent-clearance → audit → end card.
