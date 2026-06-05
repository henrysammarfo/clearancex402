# Hackathon demo runbook

**Goal:** Real Story CDR + IP + Queryline in **2–3 minutes** for the submission video. No fake txs.

**Shot-by-shot script:** [DEMO-VIDEO.md](./DEMO-VIDEO.md)  
**Form answers:** [HACKATHON-SUBMISSION.md](./HACKATHON-SUBMISSION.md)  
**A2A required?** [A2A.md](./A2A.md) — **no**

## Before you record

```bash
npm run hackathon:check
npm run setup:agents    # ~/.linestack/.env + .cursor/mcp.json from examples
```

Production: https://linestack.vercel.app/status — RPC, registry, IPFS green.

Two wallets: publisher + buyer on Aeneid (1315).

## Web demo (video — follow DEMO-VIDEO.md)

| Act | Time | Route |
|-----|------|--------|
| Hook + status | 0:00–0:25 | `/` → `/status` |
| Vaultline | 0:25–1:15 | create → upload → register IP → buy → unlock |
| Queryline | 1:15–2:30 | dataset → seed → template → request → fulfill → unlock |
| Agents | 2:30–2:45 | `/mcp` (17 tools) |

## Agent demo (Cursor / MCP)

1. `/linestack-agent-setup` then `/linestack-cdr-demo` in Agent chat.
2. Or CLI: `linestack status` → full flow in [SDK-CLI-MCP.md](./SDK-CLI-MCP.md).

## Talking points

- Story **CDR** encrypts data; **PIL licenses** gate decrypt.
- **Queryline** = dataset vault vs result vault; publisher fulfill + **Automata** on-chain.
- **Agents:** MCP + CLI + SDK — same registry as web ([AGENT-INTEGRATIONS.md](./AGENT-INTEGRATIONS.md)).

## npm publish (maintainer)

[NPM-PUBLISH-COMMANDS.md](./NPM-PUBLISH-COMMANDS.md)

## If live fails

- `/status` for RPC/API/IPFS/registry.
- Wrong chain → switch to **1315**.
- Fulfill → publisher wallet + `USE_AUTOMATA_DCAP_FIXTURE=1` on server (Vercel) and in `~/.linestack/.env` for CLI/MCP.
