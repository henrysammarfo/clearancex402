# Architecture — Turn Data into Programmable IP

Line Stack implements the **CDR + Story marketplace** model: private data becomes **on-chain programmable IP** with **conditional access**, not a one-time black-box sale.

**Visual:** https://linestack.vercel.app/architecture  
**Live app:** https://linestack.vercel.app

---

## Status Quo vs New Model

| Status Quo | New Model (Line Stack + CDR + Story) |
|------------|-------------------------------------|
| One-time payment | **Recurring income** — licenses, queries, listings |
| Loss of control | **Contributor ownership** — you hold keys & IP registration |
| Black box | **Auditable proof** — Story tx hashes, audit log, EIP-712 + Automata on fulfill |

---

## Eight-step mapping (reference diagram)

| Step | CDR / Story concept | Line Stack implementation |
|------|---------------------|---------------------------|
| **1. Upload** | Contributor adds voice, video, text | **Vaultline:** `upload-file` · **Queryline:** `create-dataset` + `seed` rows |
| **2. Protect** | Encrypt + secure off-chain storage | **CDR** allocate/write + **VPS IPFS** / Storacha pin |
| **3. Register** | Story **IP Asset** (on-chain deed) | **Vaultline:** `register-ip` → IPA + `licenseTermsId` |
| **4. Bundle** | Compose **datasets** (derivative IP) | **Queryline:** dataset vault + **allow-listed templates** · **Vaultline:** vault + listing |
| **5. Purchase** | Buyer pays (currency / token) | **Vaultline:** `buy-license` (WIP) · **Queryline:** `request-query` (result vault allocated) |
| **6. Verify** | License token + TEE validators choreograph | **CDR conditions** at decrypt · Story license mint · **Automata** `verifyAndAttestOnChain` on fulfill |
| **7. Access** | Conditional decryption, partial keys | **Vaultline:** `unlock-file` · **Queryline:** publisher `fulfill` → buyer `unlock-result` (dataset vault never exposed) |
| **8. Earn** | Royalties to contributors | **Story PIL** terms + listing price · audit rows with revenue-related txs |

---

## Full stack

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

**Visual:** https://linestack.vercel.app/architecture (dark box diagrams)

| Layer | Technology | Role |
|-------|------------|------|
| **Web** | Vercel + TanStack | Vaultline / Queryline UI, audit, attestation display |
| **Agents** | `@line-stack/mcp-server`, CLI, SDK | Same flows as UI (shared registry) |
| **Registry** | VPS JSON API | Listings, datasets, requests (shared marketplace state) |
| **Storage** | IPFS proxy + Storacha | Encrypted blobs off-chain |
| **Crypto** | `@piplabs/cdr-sdk` | Vaults, read/write conditions, decrypt |
| **IP** | Story Protocol SDK | Register IP, mint licenses, PIL terms |
| **Contracts** | `LINESTACK_*` on Aeneid | Dataset/template registry, custom conditions |
| **Attestation** | Automata DCAP + EIP-712 | Verifiable fulfill binding (Queryline) |

---

## Eight-step lifecycle

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

---

## Product split

```mermaid
flowchart TB
  CORE[Story Aeneid + CDR + shared registry]
  CORE --> VL[Vaultline: encrypt → IP → license → decrypt file]
  CORE --> QL[Queryline: dataset vault → fulfill → result vault → answer only]
```

---

## Vaultline access model

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

---

## Queryline access model (honest)

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

- **6. Verify / 7. Access:** CDR enforces **who** can decrypt **which vault**.
- Template execution is **publisher-side** until Story ships enclave `executeQuery` in the SDK.
- **Automata** adds on-chain proof that fulfill attestation ran (see `docs/ATTESTATION.md`).

---

## Agent + human actors

| Actor | Interfaces |
|-------|------------|
| Contributor / publisher | Web, CLI, MCP |
| Buyer | Web, CLI, MCP (second wallet) |
| Validator / TEE narrative | Automata on-chain DCAP (Intel quote verified on Aeneid) |

**A2A negotiate protocol:** not implemented — agents use MCP tools directly ([A2A.md](./A2A.md)).

---

## Related

- [QUERYLINE.md](./QUERYLINE.md) · [ATTESTATION.md](./ATTESTATION.md) · [CONTRACTS.md](./CONTRACTS.md)
- [HACKATHON-SUBMISSION.md](./HACKATHON-SUBMISSION.md) — paste “how we use CDR” from step table above
