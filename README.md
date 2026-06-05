# Line Stack

**Confidential data marketplace on [Story](https://story.foundation) Aeneid (chain 1315)** — sell licensed private files and licensed answers. Real CDR vaults, Story PIL licenses, on-chain audit, and agent tooling. No mock txs.

| Product | For | What buyers get |
|---------|-----|-----------------|
| **Vaultline** | Creators, analysts, research teams | Pay → mint license → **decrypt the file** (reports, CSVs, packs) |
| **Queryline** | Data owners with sensitive datasets | Pay → request template → **unlock the answer only** (raw dataset never exposed) |

**Live app:** https://linestack.vercel.app  
**Architecture (visual):** https://linestack.vercel.app/architecture  
**Author:** [henrysammarfo](https://github.com/henrysammarfo)  
**Hackathon:** [CDR Hackathon](https://story.foundation) — form copy in [docs/HACKATHON-SUBMISSION.md](docs/HACKATHON-SUBMISSION.md)  
**Fresh E2E test:** [docs/FRESH-E2E-TEST.md](docs/FRESH-E2E-TEST.md) · **Why CDR:** [docs/CDR-WHY-IT-MATTERS.md](docs/CDR-WHY-IT-MATTERS.md)

---

## Problem → solution

| Problem | Line Stack solution |
|---------|---------------------|
| Valuable data shared via Drive links and DMs — no license, easy leak | **Vaultline:** encrypt into CDR vaults, register as Story IP, **pay-to-unlock** with PIL |
| Buyers must buy the whole dataset to get one insight | **Queryline:** **dataset vault** (publisher-only) + **result vault** (buyer gets answer only) |
| Every Story/CDR app rebuilds vaults, conditions, unlock, audit | **SDK, CLI, MCP** — same registry and txs as the web app |

**Who uses it:** **Publishers** monetize data · **Buyers** pay for access or answers · **Builders** embed the rails in new Story apps and agents.

**How value flows:** listing/query fees and licenses on Story testnet today; roadmap = marketplace take rate + hosted console for teams (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)).

---

## Architecture diagrams

**Visual (dark flow boxes):** https://linestack.vercel.app/architecture  
**Deep dive:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### Full stack

```mermaid
flowchart TB
  subgraph L5["Users"]
    P[Publisher]
    BY[Buyer]
    AG[Builder / AI agent]
  end
  subgraph L4["Web · Vercel"]
    WEB[linestack.vercel.app]
    VL[Vaultline · Queryline · Audit]
  end
  subgraph L3["Agents"]
    MCP["@line-stack/mcp-server"]
    CLI["@line-stack/cli"]
    SDK["@line-stack/sdk"]
  end
  subgraph L2["Shared services · VPS"]
    REG[Registry API]
    IPFS[IPFS proxy]
    API[Story-API upstream]
  end
  subgraph L1["Story Aeneid · 1315"]
    CDR[CDR vaults]
    PIL[PIL licenses]
    LIN[LINESTACK registries]
    AUT[Automata DCAP]
  end
  L5 --> L4
  L4 --> L3
  L3 --> L2
  L2 --> L1
  WEB -.->|HTTPS /api/story-api proxy| API
```

---

### Eight-step marketplace lifecycle

```mermaid
flowchart LR
  subgraph phase1["Phase 1 — Creation"]
    S1[1 Upload] --> S2[2 Protect] --> S3[3 Register] --> S4[4 Bundle]
  end
  subgraph phase2["Phase 2 — Transaction"]
    S5[5 Purchase] --> S6[6 Verify] --> S7[7 Access] --> S8[8 Earn]
  end
  phase1 --> phase2
```

| Step | Vaultline | Queryline |
|------|-----------|-----------|
| 1–4 | File → CDR + IPFS → Story IP → listing | Dataset → templates |
| 5–8 | Buy license → verify → unlock file | Request → fulfill → unlock answer |

---

### Product split (shared CDR)

```mermaid
flowchart TB
  CORE[Story Aeneid + CDR + shared registry]
  CORE --> VL[Vaultline: encrypt → IP → license → decrypt file]
  CORE --> QL[Queryline: dataset vault → fulfill → result vault → answer only]
```

---

### Vaultline access model

```mermaid
flowchart LR
  subgraph publisher["Publisher"]
    V[encrypt + CDR vault]
    IP[Story IP + listing]
  end
  subgraph buyer["Buyer"]
    LIC[mint license]
    UN[unlock file]
  end
  V --> IP
  IP --> LIC
  LIC --> UN
  V -.->|no license| buyer
```

**Try:** `/vaultline` → create vault → upload → register IP → listings → buy → unlock  

---

### Queryline access model (honest)

```mermaid
flowchart LR
  subgraph publisher["Publisher"]
    DV[dataset vault]
    F[fulfill: decrypt → template → write]
  end
  subgraph buyer["Buyer"]
    RV[result vault]
    U[unlock answer only]
  end
  DV --> F
  F --> RV
  RV --> U
  DV -.->|no access| buyer
```

- Publisher-side fulfill until CDR `executeQuery`; **vault isolation is real**.  
- EIP-712 + Automata DCAP on fulfill.  

**Try:** `/queryline` → seed dataset → template → request → fulfill → unlock result  

Details: [docs/QUERYLINE.md](docs/QUERYLINE.md) · [docs/ATTESTATION.md](docs/ATTESTATION.md)

---

## Live stack

| Layer | Where |
|-------|--------|
| Web UI | [Vercel](docs/VERCEL-ENV.md) — `linestack.vercel.app` |
| Story-API (browser) | HTTPS proxy `/api/story-api` → VPS Story-API |
| IPFS + registry | Vultr VPS ([docs/IPFS-VPS.md](docs/IPFS-VPS.md), [docs/REGISTRY-VPS.md](docs/REGISTRY-VPS.md)) |
| Contracts | Dataset/template registries + conditions on Aeneid ([docs/CONTRACTS.md](docs/CONTRACTS.md), `contracts/deployed.aeneid.json`) |
| Attestation | EIP-712 fulfill binding + [Automata DCAP](docs/ATTESTATION.md) on Aeneid |

---

## Quick start (developers)

```bash
git clone https://github.com/henrysammarfo/linestack.git
cd linestack
cp .env.example .env.local   # fund wallet: https://faucet.story.foundation
npm install
npm run build:core
npm run dev                    # http://localhost:8080
```

**Checks:**

```bash
npm run hackathon:check
npm run test:beta-env
npm run setup:agents
```

**Two-wallet E2E:** publisher wallet + buyer wallet (incognito) on **Aeneid 1315** — [docs/BETA-ONBOARDING.md](docs/BETA-ONBOARDING.md)

**Agents (CLI / SDK / MCP):**

| Doc | Purpose |
|-----|---------|
| [docs/AGENT-INTEGRATIONS.md](docs/AGENT-INTEGRATIONS.md) | Cursor, Claude, ChatGPT, Gemini |
| [docs/SDK-CLI-MCP.md](docs/SDK-CLI-MCP.md) | Commands & MCP tools |
| [.linestack.env.example](.linestack.env.example) | `~/.linestack/.env` template |
| [AGENTS.md](AGENTS.md) | Short rules for coding agents |
| [docs/config/cursor-mcp.json](docs/config/cursor-mcp.json) | MCP config snippet |

---

## npm packages

| Package | Description |
|---------|-------------|
| [`@line-stack/cdr-core`](packages/cdr-core) | CDR + Aeneid + registry + attestation |
| [`@line-stack/sdk`](packages/sdk) | Node `LineStack` API |
| [`@line-stack/cli`](packages/cli) | `linestack` terminal |
| [`@line-stack/mcp-server`](packages/mcp-server) | 17 MCP tools (stdio) |

```bash
npm install -g @line-stack/cli @line-stack/mcp-server
```

Publish (maintainer): [docs/NPM-PUBLISH-COMMANDS.md](docs/NPM-PUBLISH-COMMANDS.md) · [docs/PUBLISHING.md](docs/PUBLISHING.md). **Never share npm tokens in chat.**

---

## Docs index

Full index: **[docs/README.md](docs/README.md)**

| Doc | Audience |
|-----|----------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | CDR + Story eight-step map + Queryline diagram |
| [QUERYLINE.md](docs/QUERYLINE.md) | What works today, two-wallet test |
| [HACKATHON-SUBMISSION.md](docs/HACKATHON-SUBMISSION.md) | Google form answers |
| [DISCORD-SUBMISSION.md](docs/DISCORD-SUBMISSION.md) | Discord post copy |
| [DEMO-VIDEO.md](docs/DEMO-VIDEO.md) | **2–3 min** video script |
| [HACKATHON.md](docs/HACKATHON.md) | Pre-record checklist |
| [BETA-ONBOARDING.md](docs/BETA-ONBOARDING.md) | Testers & devs |

---

## Security

- Never put `WALLET_PRIVATE_KEY` on Vercel or in `VITE_*` vars.
- See [SECURITY.md](SECURITY.md).

---

## License

MIT — see [LICENSE](LICENSE).
