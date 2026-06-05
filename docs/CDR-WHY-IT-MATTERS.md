# Why CDR? (for judges, partners, and Jacob-style questions)

Short answers you can paste in Discord or demos.

---

## What is CDR actually hiding?

**The plaintext bytes** — and **who is allowed to decrypt them**.

- Files and dataset rows are encrypted **before** they leave the browser/CLI.
- Only wallets that match the vault **read condition** get validator partials to decrypt.
- Buyers without a valid Story **license token** (when license-gated) get **ACCESS_DENIED** from CDR — not a soft UI error.

CDR does **not** hide that a vault exists on chain. It hides **content** and enforces **policy at decrypt time**.

---

## Why do we need CDR (vs “just encrypt and put on IPFS”)?

| Without CDR | With CDR |
|-------------|----------|
| Key in app config or buyer email | Keys tied to **on-chain conditions** |
| “Trust us we won’t read the dataset” | **Decrypt fails** if condition not met |
| No standard Story license hook | **PIL license token** in read condition |
| Each app reinvents crypto + policy | **Same vault/allocate/write/access** everywhere |

Story needs **programmable, on-chain-gated confidentiality** for IP + data markets. CDR is that layer on Aeneid.

---

## Concrete example (simplest)

**Vaultline — sell the file**

1. Creator uploads a paid research PDF → encrypted to a CDR vault.
2. Registers as Story IP, lists on Vaultline.
3. Buyer pays → mints license → CDR decrypts **only for that buyer’s wallet**.

**Queryline — sell the answer, not the spreadsheet**

1. Fintech keeps 50k merchant rows in a **dataset vault** (only their wallet reads).
2. VC pays for: “Average GMV by region in Q1.”
3. Publisher runs an **allow-listed template**, writes JSON answer into a **result vault**.
4. VC unlocks **only the result vault** — never sees raw rows.

---

## Who is it for?

- **Publishers** — creators, analysts, data owners who won’t ship raw data in a Drive link.
- **Buyers** — funds, apps, researchers who need **licensed** access or **licensed answers**.
- **Builders** — Story apps/agents using `@line-stack/sdk`, CLI, MCP (same registry + txs as the web app).

---

## Gotchas (we document openly)

1. **Queryline fulfill is publisher-side today** — CDR SDK doesn’t expose enclave `executeQuery` yet. Trust today = vault isolation + EIP-712 binding + Automata attest on fulfill.
2. **Large files** use a **separate CDR file vault** per upload — unlock with the **file CDR uuid**, not always the parent vault label.
3. **Multiple MetaMask prompts** — allocate + write + license mint are separate chain txs (not mocked).
4. **Registry** is shared VPS JSON (durable for hackathon); not a substitute for long-term Postgres.
5. **Legacy approaches** — static encryption, TEE enclaves without chain policy, “download link + honor system” — CDR adds **policy at decrypt** on Story.

---

## How Line Stack maps to hackathon ideas

- **Idea 02 — Data marketplace:** Vaultline (encrypt → IP → license → decrypt file).
- **Idea 03 — Confidential query marketplace:** Queryline (dataset vault + result vault + templates).
- **Composable vaults:** Web, CLI, SDK, MCP share one registry and condition helpers.

Live: **https://linestack.vercel.app** · Repo: **https://github.com/henrysammarfo/linestack**
