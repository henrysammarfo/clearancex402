# Discord submission — copy-paste

Post in the **MetaMask × 1Shot × Venice** cook-off Discord when your videos are ready.

---

## Short post (recommended)

```
**Clearance402** — trust layer for x402 & MCP agent payments (Base Sepolia)

Before your agent pays, it gets clearance:
• **Probe** — real HTTP 402 → USDC → verified response
• **Evaluate** — Venice AI or heuristic fallback (demo always works)
• **Check** — ALLOW / WARN / BLOCK with ERC-7715 spend caps
• **Pay-if-cleared** — server-side x402 execution + audit log

Live: https://clearancex402.vercel.app
Repo: https://github.com/henrysammarfo/clearancex402
Demo video: <YOUR_YOUTUBE_DEMO_URL>
Pitch video: <YOUR_YOUTUBE_PITCH_URL>

Agents: @clearance402/sdk · CLI · MCP — 22/22 smoke tests on production.
Free judge path: Payment Lab → Clearance402 x402 Demo (no Venice credits).
```

---

## Thread reply (if asked “how does x402 + MetaMask work?”)

```
1. Server probe wallet settles real x402 on Base Sepolia (built-in /api/demo/x402)
2. User wallet = account ID; Postgres persists probes, permissions, audit
3. ERC-7715-style mandates: per-call cap, daily cap, domain allowlist
4. Agent calls /api/clearance/check → ALLOW/WARN/BLOCK before /api/clearance/pay
5. SDK + CLI + MCP expose the same APIs for autonomous agents
6. Venice scores output when VENICE_API_KEY is set; heuristic fallback otherwise
```

---

## After npm publish (optional add-on line)

```
npm: @clearance402/sdk @clearance402/cli @clearance402/mcp-server
npx -y @clearance402/mcp-server
```
