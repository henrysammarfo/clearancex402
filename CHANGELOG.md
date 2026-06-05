# CHANGELOG.md

All notable changes to Line Stack. Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- `docs/README.md` — documentation index
- `docs/DISCORD-SUBMISSION.md` — hackathon Discord copy
- `docs/DEPLOYMENT.md`, `docs/ENVIRONMENT.md` (moved from repo root)

### Removed

- Internal agent memory files from root (`TASKS`, `PROJECT_MEMORY`, `TEST_REPORT`, `BUGS`, `ASSUMPTIONS`, `PHASE1-FOUNDATION`)
- Stale compiled `packages/sdk/src/*.js` duplicates (publish uses `dist/` only)
- Maintainer-only `scripts/git-env-author-fix.sh`

### Changed

- `DECISIONS.md` → `docs/DECISIONS.md`; `SETUP-WALLET-RPC-VERCEL.md` → `docs/SETUP-WALLET.md`
- `.gitignore` — `.git-rewrite/`, `assets/`, local import env files

### Added (historical)

- wagmi + RainbowKit wallet connect in header; live `/status` RPC probes
- `CdrTransactionForm` — real CDR `allocate()` on `/vaultline/create-vault`
- `vaultline_verify_access` MCP tool entry
- `docs/SETUP-WALLET-RPC-VERCEL.md`, `vercel.json`
- `docs/PHASE1-FOUNDATION.md` — phase gate summary
- GitHub Actions workflow `.github/workflows/cdr-core.yml`
- Monorepo workspace with `@line-stack/cdr-core` package wrapping `@piplabs/cdr-sdk@0.2.1`
- Nine project memory files (PROJECT_MEMORY, TASKS, DECISIONS, ASSUMPTIONS, ENVIRONMENT, BUGS, TEST_REPORT, CHANGELOG, DEPLOYMENT)
- Verified Aeneid network configuration from Story official documentation
- Structured logging and CDR error mapping in `cdr-core`
- `.env.example` with documented public endpoints only

### Changed

- Root package renamed to `line-stack` (workspace root)

### Security

- Documented that `WALLET_PRIVATE_KEY` must never ship to browser bundles

## [0.0.0-shell] — 2026-05-30 (pre-Line Stack packages)

- TanStack Start UI shell for Vaultline + Queryline routes (Phase 0)
