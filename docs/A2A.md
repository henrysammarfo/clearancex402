# Agent-to-agent (A2A) — do you need it?

## Short answer

**No — A2A is not required** for the CDR Hackathon submission or for Line Stack to be a strong **Technical Implementation** / **Best CDR App** entry.

You already cover **“agents can use the product”** via **MCP + CLI + SDK** (17 tools, same registry as the web app).

---

## What Story’s “A2A” demo is

The hackathon highlights [AI Negotiate](https://cdr-ai-negotiate-web.vercel.app): two AI agents **negotiate a price**, settle on-chain, mint a license, then CDR unlocks data — using **A2A** (agent-to-agent protocol) + **AP2** (payments) + **CDR**.

That is a **specific protocol stack** for autonomous negotiation between agents, not the same thing as “our app has an MCP server.”

---

## What Line Stack provides today

| Capability | Line Stack | Story A2A demo |
|------------|------------|----------------|
| CDR vaults + licenses | Yes (Vaultline) | Yes |
| Licensed answers without raw data | Yes (Queryline) | Partial / different flow |
| Human or agent drives UI/CLI | Yes | Agents negotiate with each other |
| MCP tools for agents | Yes (`@line-stack/mcp-server`) | Custom integration |
| A2A protocol handshake | **No** | Yes |
| AP2 payment mandates | **No** | Yes |

**Positioning for judges:**

> “Line Stack is **agent-ready**: any MCP host (Cursor, Claude, Codex) can run Vaultline and Queryline with real CDR txs. We did not implement Google A2A negotiation loops; buyers and publishers can still be **software agents** calling our MCP tools or CLI.”

That fits **Idea 02** (data marketplace) and **Idea 03** (confidential query marketplace) without claiming **Idea 04** (full A2A negotiate UI).

---

## When you would add A2A later

Only if you want to compete directly with the AI Negotiate narrative:

1. Expose a **buyer agent** MCP profile that calls `queryline_request_query` + `vaultline_buy_license`.
2. Expose a **seller agent** that lists and fulfills.
3. Wire **A2A** message format between them (separate from MCP stdio).

That is a **follow-on project**, not a hackathon blocker.

---

## What to write on the submission form

Under “how your project uses CDR,” focus on vaults, conditions, marketplace, and attestation. One optional sentence:

> “Agents integrate via MCP and CLI; A2A negotiation is future work — humans or single agents drive flows today.”

Do not claim A2A unless you implement the protocol.
