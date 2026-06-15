# Step 1 — Pitch voiceover (ElevenLabs)

**Goal:** ~90 seconds of narration for your pitch video.  
**Time:** ~20 minutes  
**Output:** 7 MP3 clips you stitch in CapCut, DaVinci, or Clipchamp.

---

## Why pasting the whole script sounds rushed

When you paste all 90 seconds into ElevenLabs at once, the model reads it as **one continuous paragraph** — no breath between scenes, no gap before the tagline.

**Fix:** Generate **one clip per scene** (below). You control the pause in your video editor by leaving 1–2 seconds of silence between clips.

---

## ElevenLabs settings (use these)

| Setting | Value |
|---------|--------|
| **Model** | **Eleven Multilingual v2** or **Turbo v2.5** (SSML `<break>` works) |
| **Avoid** | Eleven v3 for this workflow unless you use `[long pause]` tags (see bottom) |
| **Stability** | 50–65% |
| **Similarity** | 75% |
| **Style exaggeration** | 0–15% (keep low for pitch) |

**Voice tip:** Pick a calm, neutral voice (e.g. “Adam”, “Rachel”, “Brian” — preview 2–3).

---

## How to generate (recommended — 7 clips)

In ElevenLabs → **Text to Speech**:

1. Paste **only Clip 1** text (nothing else).
2. Click **Generate**.
3. Download as `pitch-01-problem.mp3`.
4. Repeat for clips 2–7.

Do **not** paste multiple clips in one box.

### Clip 1 — Problem (~12 sec)

```
Every week, AI agents pay for APIs they've never verified.
One bad endpoint can drain USDC in seconds.
```

### Clip 2 — Solution (~10 sec)

```
Clearance402 is the trust layer for agent payments.
Before your agent pays, it gets clearance.
```

### Clip 3 — x402 probe (~10 sec)

```
On Base Sepolia, we run a live x402 probe.
HTTP 402, USDC settlement, real response. No mocks.
```

### Clip 4 — Venice (~10 sec)

```
We score output with Venice when you have API credits.
Or a local heuristic when you don't, so demos always work.
```

### Clip 5 — Permissions (~13 sec)

```
Operators grant ERC-7715 permissions with caps and domain allowlists.
Agents hit our check API and get ALLOW, WARN, or BLOCK, with reasons.
```

### Clip 6 — Pay + audit (~10 sec)

```
Only cleared payments execute.
Every step lands in an audit log.
SDK, CLI, and MCP ship for agent hosts.
```

### Clip 7 — Close (~8 sec)

```
Built for the MetaMask, 1Shot, and Venice cook-off.
Live at clearancex402 dot vercel dot app.
Before your agent pays, clearance.
```

**Pronunciation note:** Say “clearancex402 dot vercel dot app” so TTS doesn't garble the URL. Put the real URL on screen.

---

## Stitching in your editor

| Clip | Leave on timeline | B-roll while audio plays |
|------|-------------------|--------------------------|
| 1 | 12s (+ 1s gap after) | Problem slide or dark screen |
| 2 | 10s (+ 1s gap) | Logo + tagline (`public/media/pitch-slide-title.png`) |
| 3 | 10s (+ 1s gap) | Architecture or Payment Lab |
| 4 | 10s (+ 1s gap) | Venice eval screen |
| 5 | 13s (+ 1s gap) | Permissions page |
| 6 | 10s (+ 1s gap) | Agent clearance + audit |
| 7 | 8s | End card with URL |

**Total:** ~83s audio + ~6s gaps ≈ **90 seconds**

---

## Alternative — one paste with pause tags

Only if you insist on a single generation. Use **Multilingual v2** (not v3):

```
Every week, AI agents pay for APIs they've never verified. <break time="0.8s"/> One bad endpoint can drain USDC in seconds. <break time="1.5s"/>

Clearance402 is the trust layer for agent payments. <break time="0.6s"/> Before your agent pays, it gets clearance. <break time="1.5s"/>

On Base Sepolia, we run a live x402 probe. <break time="0.6s"/> HTTP 402, USDC settlement, real response. No mocks. <break time="1.5s"/>

We score output with Venice when you have API credits. <break time="0.6s"/> Or a local heuristic when you don't, so demos always work. <break time="1.5s"/>

Operators grant ERC-7715 permissions with caps and domain allowlists. <break time="0.6s"/> Agents hit our check API and get ALLOW, WARN, or BLOCK, with reasons. <break time="1.5s"/>

Only cleared payments execute. <break time="0.6s"/> Every step lands in an audit log. <break time="0.6s"/> SDK, CLI, and MCP ship for agent hosts. <break time="1.5s"/>

Built for the MetaMask, 1Shot, and Venice cook-off. <break time="0.6s"/> Live at clearancex402.vercel.app. <break time="0.6s"/> Before your agent pays, clearance.
```

**Important:**
- Use self-closing tags: `<break time="1.5s"/>` not `<break time="1.5s"></break>`
- Don't use more than ~8 break tags or audio can get unstable
- **7-clip method is still more reliable**

### If you use Eleven v3 only

Replace `<break time="1.5s"/>` with `[long pause]` between scenes:

```
Every week, AI agents pay for APIs they've never verified. One bad endpoint can drain USDC in seconds. [long pause]

Clearance402 is the trust layer for agent payments. Before your agent pays, it gets clearance. [long pause]
```

---

## Checklist — Step 1 done when:

- [ ] 7 MP3 files downloaded (`pitch-01` … `pitch-07`)
- [ ] Listened once — no garbled words (re-generate single clip if needed)
- [ ] Clips imported into video editor with ~1s gap between each

**Next step:** [Step 2 — Pitch visuals](./MEDIA-STEPS.md#step-2--pitch-visuals-gamma--b-roll) (we do this after your audio is ready)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No pauses at all | You're on v3 without `[long pause]` — switch to Multilingual v2 or use 7-clip method |
| Audio speeds up / noisy | Too many `<break>` tags — use 7-clip method instead |
| Robotic delivery | Lower stability to ~45%; add a comma where you'd naturally breathe |
| Wrong emphasis on "402" | Write "four oh two" in that sentence if needed |
