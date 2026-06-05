# DECISIONS.md — Architecture decision log

Format: **ADR-NNN** — Title — Date — Status

---

## ADR-001 — Wrap official CDR SDK in `@line-stack/cdr-core`

**Date:** 2026-05-30  
**Status:** Accepted

**Context:** Line Stack must integrate Story Confidential Data Rails without inventing APIs. The canonical client is `@piplabs/cdr-sdk` v0.2.1 (Aeneid).

**Decision:** All chain/CDR access goes through `@line-stack/cdr-core`, which wraps `CDRClient`, `initWasm`, Aeneid constants, env parsing, and logging.

**Alternatives considered:**

- Call `@piplabs/cdr-sdk` directly from web — rejected (config duplication, harder testing).
- Fork cdr-sdk — rejected (maintenance burden).

**Consequences:** Positive: one config surface, easier MCP/CLI/SDK layers. Negative: must track upstream CDR SDK releases.

---

## ADR-002 — npm workspaces monorepo

**Date:** 2026-05-30  
**Status:** Accepted

**Context:** TanStack Start web app + `@line-stack/*` packages share types and `@line-stack/cdr-core`.

**Decision:** Root `package.json` uses `"workspaces": ["packages/*"]` with `package-lock.json`. Vercel installs via `npm install`.

**Alternatives:** pnpm turbo monorepo — deferred until CI complexity warrants it.

---

## ADR-003 — Defer `apps/web` move until Phase 4

**Date:** 2026-05-30  
**Status:** Accepted

**Context:** Large route tree under `src/` works today.

**Decision:** Keep web at repo root for Phase 1–3; add `packages/cdr-core` only.

**Consequences:** Bible monorepo layout partially met; rename repo to `line-stack` optional later.

---

## ADR-004 — Use CDR built-in conditions before custom contracts

**Date:** 2026-05-30  
**Status:** Proposed

**Context:** Bible lists `SignalAccessCondition`, `QueryAccessCondition`, etc. CDR Aeneid already deploys `OwnerWriteCondition` and `LicenseReadCondition`.

**Decision:** Phase 2 MVP uses deployed CDR conditions; custom Line Stack contracts added when bible flows need semantics not covered by license/owner conditions.

**Consequences:** Faster path to real decrypt; custom contracts remain Phase 2b.

---

## ADR-005 — No simulated transaction success in UI

**Date:** 2026-05-30 (inherited from initial UI shell)  
**Status:** Accepted

**Context:** Hackathon and bible no-mock policy.

**Decision:** Forms either call real SDK paths or end in `NotConnectedState` / explicit error — never fake `SuccessState` with fabricated tx hashes.

**Consequences:** `/vaultline/unlock` UI preview branches must be removed or gated when wiring real CDR.

---

## ADR-006 — Browser wallet: wagmi + viem + RainbowKit

**Date:** 2026-05-30  
**Status:** Accepted

**Context:** Phase 3 needs production-grade wallet connect on TanStack web. CDR SDK and `cdr-core` already use viem. Story setup docs reference wagmi, Privy, and RainbowKit.

**Decision:** **wagmi v2 + viem + RainbowKit** for the web app. Privy deferred unless email/social login becomes a requirement.

**Alternatives:** Privy (more auth features, vendor lock-in); wagmi-only (minimal UI); server-only first (CLI/demo only).

**Consequences:** Add `@wagmi/core`, `wagmi`, `@rainbow-me/rainbowkit` in Phase 3; connect to `createLineStackCdrClient` via injected provider pattern from Story docs.

---

## ADR-007 — Deploy target: Vercel (user-confirmed)

**Date:** 2026-05-30  
**Status:** Accepted

**Context:** User deploys via Vercel dashboard (import repo, env vars).

**Decision:** Target **Vercel** for hosting with TanStack Start + Nitro (`preset: vercel`, output `.vercel/output`). Env vars via Vercel dashboard.

**Consequences:** SSR API routes (`/api/*`) run on Vercel serverless. See [VERCEL-ENV.md](./VERCEL-ENV.md) and `vercel.json`.
