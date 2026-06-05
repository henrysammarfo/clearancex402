# Wallet, RPC, funding, storage & Vercel setup

Verified against [Story Aeneid](https://docs.story.foundation/network/connect/aeneid) and [CDR SDK setup](https://docs.story.foundation/developers/cdr-sdk/setup).

## Wallet stack (production recommendation)

**Use: wagmi v2 + viem + RainbowKit**

| Option | Verdict | Why |
|--------|---------|-----|
| **wagmi + viem + RainbowKit** | **Recommended** | Same stack as `@piplabs/cdr-sdk` and `@line-stack/cdr-core`; Story docs show wagmi; RainbowKit gives production connect UX; no auth vendor lock-in. |
| Privy | Optional later | Better for email/social/embedded wallets; extra vendor, pricing, and scope for a **developer** product. |
| wagmi only | OK for CLI-first phase | Fine if you delay browser UI; add RainbowKit before public launch. |
| Server-only first | Hackathon shortcut | Real txs via CLI/`cdr-core` + private key; browser wallet in Phase 3. |

Line Stack will standardize on **wagmi + RainbowKit** for the web app.

---

## A. MetaMask — add Story Aeneid testnet

1. Install [MetaMask](https://metamask.io/) (browser extension).
2. Open MetaMask → network dropdown → **Add network** → **Add a network manually**.
3. Enter (from Story official docs):

| Field | Value |
|-------|--------|
| Network name | `Story Aeneid Testnet` |
| RPC URL | `https://aeneid.storyrpc.io` |
| Chain ID | `1315` |
| Currency symbol | `IP` |
| Block explorer | `https://aeneid.storyscan.io` |

4. Save and switch to **Story Aeneid Testnet**.

**Chainlist shortcut:** https://chainlist.org/chain/1315 (verify fields match before approving).

---

## B. Fund the wallet (testnet IP)

1. Copy your MetaMask address (0x…).
2. Open the official faucet: https://faucet.story.foundation  
3. Paste address → request tokens (docs: ~10 IP per request).
4. Confirm balance in MetaMask on Aeneid.
5. For **server/CLI integration tests only** (never Vercel client env): put the same key in local `.env.local` as `WALLET_PRIVATE_KEY=0x…` — use a **dedicated dev wallet**, not your main wallet.

---

## C. Alchemy RPC (if public RPC is slow)

1. Sign up: https://www.alchemy.com/
2. Create an app → choose **Story** → **Aeneid** testnet (or add custom chain if UI differs).
3. Copy the **HTTPS** URL; it looks like:  
   `https://story-aeneid.g.alchemy.com/v2/YOUR_API_KEY`
4. Use in env:

```bash
STORY_RPC_URL=https://story-aeneid.g.alchemy.com/v2/YOUR_API_KEY
VITE_STORY_RPC_URL=https://story-aeneid.g.alchemy.com/v2/YOUR_API_KEY
```

5. In Vercel: Project → Settings → Environment Variables → add `VITE_STORY_RPC_URL` (and server-side `STORY_RPC_URL` if you add API routes).

Story docs also list QuickNode: https://www.quicknode.com/chains/story — same idea: create Aeneid endpoint, paste URL into `STORY_RPC_URL`.

**Keep unchanged unless you host your own node:**

```bash
STORY_API_URL=http://172.192.41.96:1317
VITE_STORY_API_URL=http://172.192.41.96:1317
```

CDR DKG reads use Story-API REST, not the EVM RPC.

---

## D. Vercel deploy + env vars

### TanStack Start on Vercel

The web app uses **TanStack Start + Nitro** (`preset: vercel`, output `.vercel/output`). See `vercel.json` and `docs/VERCEL-ENV.md`. Do **not** use static `dist/client` or SPA rewrites.

### Vercel dashboard steps

1. Push repo to Git (GitHub/GitLab/Bitbucket — no Actions required).
2. Vercel → **Add New Project** → **Import** your repository.
3. Framework preset: **Other** (reads `vercel.json`).
4. Build command: `npm run build:core && npm run build`.
5. Output directory: `.vercel/output`.
6. **Environment Variables** (Production + Preview):

| Name | Example | Expose to browser? |
|------|---------|-------------------|
| `VITE_STORY_RPC_URL` | Alchemy or `https://aeneid.storyrpc.io` | Yes |
| `VITE_STORY_API_URL` | `http://172.192.41.96:1317` | Yes |
| `VITE_STORY_CHAIN_ID` | `1315` | Yes |
| `STORY_RPC_URL` | same as above | Server only |
| `STORY_API_URL` | same as above | Server only |
| `STORY_NETWORK` | `testnet` | Server only |

**Never** add `WALLET_PRIVATE_KEY` to Vercel client env. Server-only if you add protected API routes later.

7. Deploy → open preview URL → connect wallet on Aeneid.

---

## E. File storage (`uploadFile`) — when you need it

Vaultline uploads (CSV, PDF, datasets) need **off-chain** encrypted blobs; CDR keeps keys on-chain.

| Provider | Best for | Vercel / serverless |
|----------|----------|---------------------|
| **Storacha** (`@storacha/client`) | Production file pinning, API keys | **Recommended** for app/server uploads |
| Gateway IPFS (CDR SDK) | Simplest dev path | OK for demos |
| **Helia** | Local/full Node | **Poor fit** for Vercel Edge; needs Node runtime |
| **Synapse** | Filecoin/Synapse ecosystem | Use if you already use Filoz stack |

**Recommendation for Line Stack:**

1. **Now:** on-chain secrets via `uploadCDR` / small payloads (no storage account).
2. **Vaultline files:** **Storacha** for production; gateway IPFS for first real `uploadFile` test.
3. Add `STORACHA_TOKEN` (or provider-specific secret) only in Vercel **server** env when implemented.

---

## F. Checklist before Phase 2 wiring

- [ ] MetaMask on Aeneid (chain 1315)
- [ ] Wallet funded from faucet
- [ ] `VITE_STORY_*` set in Vercel (and `.env.local` locally)
- [ ] Optional: Alchemy RPC in `VITE_STORY_RPC_URL`
- [ ] Decision: wagmi + RainbowKit (default)
- [ ] Confirm Vercel build output path after first deploy
