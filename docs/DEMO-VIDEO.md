# Demo video — 2–3 minutes (submission)

**Target length:** 2:00–2:45 · **Format:** screen recording + voiceover · **URL:** YouTube unlisted → paste in Google form

**Live app:** https://linestack.vercel.app

---

## Pre-flight (before you hit Record)

- [ ] Production: `/status` green (RPC, registry, IPFS)
- [ ] Wallet A (publisher) + Wallet B (buyer) on **Aeneid 1315**, funded
- [ ] Incognito = buyer, normal window = publisher (or two profiles)
- [ ] Close extra tabs; zoom browser 110%; hide bookmarks bar
- [ ] Prepare a small file `demo-pack.zip` or `.json` (>1KB) for upload
- [ ] Script this tab order: Status → Vaultline flow → Queryline flow → MCP page → (optional) explorer tx

---

## Shot list (wow pacing)

| Time | Visual | Narration (say this) |
|------|--------|----------------------|
| **0:00–0:12** | **/architecture** — quick pan Status Quo → 8 steps → comparison table | “We turn data into programmable IP on CDR — not a one-time black box. Here’s the eight-step model.” |
| **0:12–0:22** | Landing → **Vaultline** | “Line Stack: Vaultline for licensed files, Queryline for licensed answers — real Story Aeneid txs.” |
| **0:15–0:25** | **/status** — all green chips | “Everything hits live Story RPC, our registry, and IPFS — no mocked success states.” |
| **0:25–0:55** | **Publisher:** Create vault → Upload file → Register IP + listing. **Show tx hash / explorer link** on success. | “Vaultline: encrypt into a CDR vault, register as Story IP, list it. Real on-chain allocate and license terms.” |
| **0:55–1:15** | **Buyer** (incognito): Listings → Buy license → Unlock → file downloads or preview. **Explorer link.** | “Buyer mints a PIL license — only then does CDR decrypt. Atomic pay-to-unlock.” |
| **1:15–1:25** | Switch to publisher — **Queryline** dashboard | “Queryline is the confidential **query marketplace**: datasets stay in a vault buyers never see.” |
| **1:25–1:45** | Create dataset → Seed sample rows → Add template `avg_value_by_region` | “Publisher seeds encrypted rows and registers an allow-listed template — on-chain registries when deployed.” |
| **1:45–2:00** | **Buyer:** Request query `{ "region": "EU" }` | “Buyer only gets a **result vault** allocated — not the dataset.” |
| **2:00–2:20** | **Publisher:** Dashboard → **Fulfill** → wait for txs. Open result → show **Attestation** + **Automata tx** link. | “Fulfill decrypts on the publisher, runs the template, writes the answer, signs EIP-712, and submits **Automata DCAP** on Story — verifiable on-chain.” |
| **2:20–2:30** | **Buyer:** Results → Unlock → show JSON answer `avg_value: 42` (or your seed) | “Buyer unlocks **only the answer** — never the full dataset.” |
| **2:30–2:45** | **/mcp** tool grid → quick scroll → optional 3s Cursor MCP settings green | “Same flows for agents: seventeen MCP tools, CLI, and SDK — one shared registry as the web app. Built for the CDR hackathon on Story Aeneid.” |

**End card (2s):** full URL `https://linestack.vercel.app` + `github.com/henrysammarfo/linestack`

---

## B-roll cuts (if something is slow)

- While tx pending: cut to **explorer** tab with confirmed tx
- While fulfill runs: split-screen **dashboard** + **network tab** (optional, only if it helps)

---

## Do not say

- “Queries run inside Story’s enclave” (not in SDK yet)
- “Fully trustless compute” (say **trustless access** + **on-chain attestation**)

## Do say

- “Real CDR txs on chain 1315”
- “Publisher-side fulfill with vault isolation — honest about SDK limits”
- “Automata attestation tx on every fulfill”

---

## MCP-only appendix (if judges care — record separately or last 20s)

In Cursor Agent: “Call `linestack_status`” → one Vaultline tool → show JSON with txHash. Not required for the 2–3 min form video if web E2E is tight.

---

## After upload

Paste YouTube link in [HACKATHON-SUBMISSION.md](./HACKATHON-SUBMISSION.md) form section.
