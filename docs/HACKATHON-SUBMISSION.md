# CDR Hackathon — submission copy (June 3, 2026)

Use this when filling the Google form. **Do not** paste secrets or npm tokens anywhere.

---

## Form fields (copy-paste)

### Your name

Henry Sam Marfo

*(Adjust if submitting under a different legal name.)*

### Title of your project

**Line Stack** — Vaultline & Queryline on Story Aeneid

### Describe what your project is (important!)

Line Stack is a **confidential data marketplace** on Story testnet (Aeneid, chain 1315) with two products:

- **Vaultline** — creators encrypt files into CDR vaults, register them as Story IP assets, list them for sale, and buyers mint a license to decrypt (real PIL + CDR, no mock txs).
- **Queryline** — publishers keep datasets in a CDR vault; buyers request an **allow-listed** query template and receive only the **answer** in a per-buyer result vault. Raw dataset rows are never exposed to buyers.

The web app is live at **https://linestack.vercel.app**. Developers can drive the same flows via **CLI, SDK, and MCP** (17 tools) against a shared registry and VPS IPFS stack.

We are honest that Queryline **fulfill** runs on the publisher side today (CDR decrypt → template → write result) because `cdr-sdk@0.2.1` does not yet expose enclave `executeQuery`. We add **EIP-712 fulfill binding** and **Automata DCAP on-chain attestation** on every fulfill for stronger verifiability.

### Describe how your project uses CDR

1. **Vault allocation & secrets** — `allocate` / `write` / `accessCDR` on Aeneid for vaults, dataset vaults, and per-buyer result vaults.
2. **Dynamic access control** — owner read/write, Story **license** read conditions for buyers, custom Line Stack publisher-write / buyer-read conditions on dataset and result vaults (`LINESTACK_*` contracts in `contracts/deployed.aeneid.json`).
3. **Data marketplace (Idea 02)** — Vaultline: encrypt → IPFS pin → register IP → listing → license mint → license-gated decrypt.
4. **Confidential query marketplace (Idea 03)** — Queryline: dataset vault (buyer cannot decrypt) + result vault (buyer can decrypt answer only); allow-listed templates in app registry + on-chain template registry.
5. **Composable vault layout** — same registry/API for web, CLI, SDK, and MCP; audit log rows tied to real tx hashes.
6. **Attestation layer** — EIP-712 signed fulfill payload + Automata `verifyAndAttestOnChain` on Story Aeneid (Intel DCAP quote verified on-chain).

### Demo video

*(Upload to YouTube — **2–3 minutes** per hackathon form.)*

**Full shot list:** [DEMO-VIDEO.md](./DEMO-VIDEO.md)

Suggested flow:

1. `/status` — RPC + registry green  
2. Vaultline: create vault → upload → register IP → (wallet B) buy license → unlock  
3. Queryline: seed dataset → request query → fulfill → unlock result → show attestation + Automata tx on explorer  
4. Optional: `/mcp` tool list or Cursor calling `linestack_status`

### Your email

jasonneil4040@gmail.com

### Discord handle (optional)

*(Your Story hackathon Discord username — then post using [DISCORD-SUBMISSION.md](./DISCORD-SUBMISSION.md).)*

### Teammates (optional)

*(Leave blank or list names.)*

### GitHub link

https://github.com/henrysammarfo/linestack

**Required:** Add GitHub user **`jacob-tucker`** as collaborator (read access is enough if repo is private).

### Which track?

Select: **Technical Implementation Track**  
*(You can note in Discord that the project also fits Best CDR App — judges may move it.)*

Suggested primary: **Technical Implementation** (conditions, multi-vault Queryline, on-chain registries, Automata).  
Strong secondary: **Best CDR App** (polish, two-product UX, live URL).

### Rate your experience (1–5)

Suggest: **4** — CDR vault/condition APIs are clear; Queryline “where does compute run?” needed reading SDK limits; Story IP + Storacha setup has moving parts.

### Was anything confusing?

*(Example — edit to your voice:)*

CDR vault/allocate/write/access was straightforward. The main nuance was that **query execution is not inside a CDR enclave yet** in the SDK — we documented publisher-side fulfill clearly. Storacha proof for `registerIp` and aligning registry env between Vercel and VPS took the most setup time.

### Feedback for Story / CDR

*(Example:)*

A single “fulfill query” example in the SDK docs (dataset vault + result vault pattern) would help hackathon teams. On-chain template registry examples alongside IP licensing would be great. Automata + Aeneid worked well for attestation demos.

---

## Pre-submit checklist

- [ ] Repo: add **jacob-tucker** on GitHub  
- [ ] Demo video on YouTube, link in form  
- [ ] `https://linestack.vercel.app` loads; `/api/registry/status` → `available: true`  
- [ ] `npm run hackathon:check` passes locally  
- [ ] `npm publish` for `@line-stack/*` — [NPM-PUBLISH-COMMANDS.md](./NPM-PUBLISH-COMMANDS.md)  
- [ ] Discord: post using [DISCORD-SUBMISSION.md](./DISCORD-SUBMISSION.md)  

---

## Links for judges

| Resource | URL |
|----------|-----|
| Live app | https://linestack.vercel.app |
| Architecture map | https://linestack.vercel.app/architecture |
| MCP tools | https://linestack.vercel.app/mcp |
| Agent runbook | https://linestack.vercel.app/agent-runbook |
| Queryline honesty | https://github.com/henrysammarfo/linestack/blob/main/docs/QUERYLINE.md |
| Agent integrations | https://github.com/henrysammarfo/linestack/blob/main/docs/AGENT-INTEGRATIONS.md |
