# Media production — images, pitch video, demo video

Everything you need to finish hackathon deliverables for **Clearance402**.

| Deliverable | Doc | Assets |
|-------------|-----|--------|
| **Pitch deck (Gamma)** | [GAMMA-PITCH.md](./GAMMA-PITCH.md) | `public/media/*` |
| **Pitch video (~90s)** | Script below + [GAMMA-PITCH.md](./GAMMA-PITCH.md) | `pitch-slide-title.png`, `og-banner.png` |
| **Demo video (~3 min)** | [DEMO-VIDEO.md](./DEMO-VIDEO.md) | `demo-thumbnail.png` + app screenshots |
| **Form copy** | [HACKATHON-SUBMISSION.md](./HACKATHON-SUBMISSION.md) | — |

---

## 1. Images (ready now)

Pre-built in **`public/media/`**:

| File | Use |
|------|-----|
| `og-banner.png` | Open Graph / Twitter / link previews |
| `pitch-slide-title.png` | Gamma slide 1 or YouTube pitch thumbnail |
| `demo-thumbnail.png` | YouTube demo video thumbnail |
| `architecture.svg` | Gamma slide 4 — “How it works” |

**Logo:** `public/logo.svg` (navbar + favicon)

### Gamma deck — quick build

1. Go to [gamma.app](https://gamma.app) → **Create presentation**
2. Paste bullets from [GAMMA-PITCH.md](./GAMMA-PITCH.md) → section **“Gamma deep load bullets”**
3. Upload images:
   - Slide 1: `pitch-slide-title.png`
   - Slide 4: `architecture.svg` (export PNG if Gamma prefers raster)
   - Slides 5–7: your app screenshots (see below)
4. Export PDF or share link for judges

### App screenshots (you record these)

Follow the table in [DEMO-VIDEO.md](./DEMO-VIDEO.md#screenshots-for-pitch-deck-capture-yourself).  
**Tip:** Windows `Win+Shift+S` at 110% browser zoom on https://clearancex402.vercel.app

Save to `docs/media/` — optional, not required for deploy.

---

## 2. Pitch video (~90 seconds)

**Format:** Talking head optional · Mostly slides or app B-roll · Upload unlisted to YouTube

**Thumbnail:** `public/media/pitch-slide-title.png` or `og-banner.png`

### Script (read verbatim or paraphrase)

| Time | Visual | Line |
|------|--------|------|
| 0:00 | Problem slide / dark B-roll | “Every week, AI agents pay for APIs they’ve never verified. One bad endpoint drains USDC in seconds.” |
| 0:12 | Logo + tagline | “Clearance402 is the trust layer for agent payments. Before your agent pays, it gets clearance.” |
| 0:22 | Architecture or probe UI | “On Base Sepolia, we run a live x402 probe: HTTP 402, USDC settlement, real response. No mocks.” |
| 0:32 | Venice eval screen | “We score output with Venice when you have API credits — or a local heuristic when you don’t, so demos always work.” |
| 0:42 | Permissions screen | “Operators grant ERC-7715 permissions with caps and domain allowlists. Agents hit our check API and get ALLOW, WARN, or BLOCK — with reasons.” |
| 0:55 | Agent clearance + audit | “Only cleared payments execute. Every step lands in an audit log. SDK, CLI, and MCP ship for agent hosts.” |
| 1:05 | End card: URL + logo | “Built for the MetaMask × 1Shot × Venice cook-off. Live at clearancex402.vercel.app. Before your agent pays — clearance.” |

**Recording tips**

- 1080p, 16:9
- Record audio in a quiet room; normalize in CapCut / DaVinci (free)
- Keep cuts every 8–12 seconds

---

## 3. Demo video (~3 minutes)

**Full shot list:** [DEMO-VIDEO.md](./DEMO-VIDEO.md)

**Thumbnail:** `public/media/demo-thumbnail.png`

### Minimum viable demo (if short on time — 2:00)

1. Landing (10s)
2. Connect wallet (10s)
3. Payment Lab → x402 demo probe with `paid: true` (40s)
4. Agent clearance → Check → ALLOW (30s)
5. Audit log scroll (20s)
6. CLI `tools list` (15s)
7. End card (5s)

### Pre-record checklist

```powershell
node scripts/smoke-clearance402.mjs https://clearancex402.vercel.app
```

Must show **22/22** before you record.

---

## 4. Upload checklist

- [ ] Pitch deck link or PDF (Gamma)
- [ ] Pitch video → YouTube (unlisted) → copy URL
- [ ] Demo video → YouTube (unlisted) → copy URL
- [ ] Paste URLs in [HACKATHON-SUBMISSION.md](./HACKATHON-SUBMISSION.md)
- [ ] Discord post: [DISCORD-SUBMISSION.md](./DISCORD-SUBMISSION.md)
- [ ] Redeploy Vercel after adding `og-banner.png` (already in `public/media/`)

---

## 5. Optional polish

- Add `docs/media/*.png` screenshots to repo for judges (git add `docs/media/`)
- npm publish: `@clearance402/sdk`, `@clearance402/cli`, `@clearance402/mcp-server` — [NPM-PUBLISH-COMMANDS.md](./NPM-PUBLISH-COMMANDS.md)
