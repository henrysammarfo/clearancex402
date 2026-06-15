# MetaMask × 1Shot × Venice — submission copy

Use when filling the hackathon Google form. **Do not** paste secrets or private keys.

---

## Form fields (copy-paste)

### Your name

Henry Sam Marfo

### Title of your project

**Clearance402** — Agent payment trust layer for x402 & MCP

### Describe what your project is (important!)

Clearance402 is the **trust layer for agent payments** on **Base Sepolia**. Before an autonomous agent pays for an x402 or MCP tool, it gets a machine-readable clearance decision — ALLOW, WARN, or BLOCK — with reasons.

The live app is at **https://clearancex402.vercel.app**. Operators connect a MetaMask wallet, run **live x402 probes** (real HTTP 402 → USDC settlement → response), evaluate output with **Venice AI** (or a **heuristic fallback** when API credits are exhausted), grant **ERC-7715-style spend permissions**, and let agents **pay only if cleared**. Every probe, payment, block, and permission event is written to an **audit log** backed by **Postgres on Vercel**.

Developers integrate via **SDK, CLI, and MCP** (`@clearance402/sdk`, `@clearance402/cli`, `@clearance402/mcp-server`). A **free built-in x402 demo** (`/api/demo/x402`) lets judges verify end-to-end without Venice credits.

### Describe how your project uses the hackathon stack

1. **x402** — Live probe flow on Base Sepolia using `@x402/fetch` and x402.org facilitator; built-in demo endpoint for judges.
2. **MetaMask Smart Accounts / ERC-7715** — Permission mandates with per-call and daily caps, domain allowlists, revocation; checked before pay-if-cleared.
3. **Venice AI** — Output quality scoring via `api.venice.ai/api/v1/chat/completions`; heuristic fallback ensures demos work without credits.
4. **Agent surfaces** — MCP server, CLI, and SDK for autonomous clearance checks; A2A lab coordinates Scout/Buyer/Verifier/Guardian roles.
5. **Production** — Vercel deploy + Neon Postgres; **22 automated smoke tests** (API, SDK, CLI, MCP).

### Demo video

*(Upload to YouTube — **2–3 minutes**.)*

**Shot list:** [DEMO-VIDEO.md](./DEMO-VIDEO.md)

Suggested flow:

1. Landing + `/status` — production green  
2. Connect wallet → Payment Lab → **x402 demo probe** (`paid: true`)  
3. Venice eval (or heuristic fallback)  
4. Permissions → Agent clearance → **Check** → **Pay if cleared**  
5. Audit log → CLI `tools list` → MCP page  

### Pitch video (if separate field)

**~90 seconds** — script in [GAMMA-PITCH.md](./GAMMA-PITCH.md) and [MEDIA-PRODUCTION.md](./MEDIA-PRODUCTION.md)

### Your email

jasonneil4040@gmail.com

### Discord handle (optional)

*(Your cook-off Discord username — post using [DISCORD-SUBMISSION.md](./DISCORD-SUBMISSION.md).)*

### Teammates (optional)

*(Leave blank or list names.)*

### GitHub link

https://github.com/henrysammarfo/clearancex402

### Live demo URL

https://clearancex402.vercel.app

### Which track(s)?

- x402 + ERC-7710  
- Best Agent  
- A2A  
- Venice AI  

### Rate your experience (1–5)

Suggest: **4** — x402 + Smart Accounts integration is powerful; Venice x402 is mainnet-only so we use API key + heuristic fallback for Sepolia demos.

### Was anything confusing?

*(Example — edit to your voice:)*

Venice’s x402 payment path targets Base mainnet; for Sepolia demos we use the REST API with `VENICE_API_KEY` and a local heuristic when credits run out. Postgres on Vercel required the Neon serverless driver instead of `pg`.

### Feedback

A single “agent pay-if-cleared” reference implementation tying x402 + ERC-7715 + audit would help future hackathon teams.

---

## Pre-submit checklist

- [ ] Demo video on YouTube, link in form  
- [ ] Pitch video / Gamma deck (if required)  
- [ ] `https://clearancex402.vercel.app` — smoke **22/22**  
- [ ] Discord post: [DISCORD-SUBMISSION.md](./DISCORD-SUBMISSION.md)  
- [ ] npm publish (optional): [NPM-PUBLISH-COMMANDS.md](./NPM-PUBLISH-COMMANDS.md)  

---

## Links for judges

| Resource | URL |
|----------|-----|
| Live app | https://clearancex402.vercel.app |
| Status API | https://clearancex402.vercel.app/api/clearance/status |
| Free x402 demo | https://clearancex402.vercel.app/api/demo/x402 |
| MCP / agents | https://clearancex402.vercel.app/mcp |
| Media guide | https://github.com/henrysammarfo/clearancex402/blob/main/docs/MEDIA-PRODUCTION.md |
| Smoke script | `node scripts/smoke-clearance402.mjs https://clearancex402.vercel.app` |
