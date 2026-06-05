# Storacha CLI (file uploads for CDR `uploadFile`)

Console signup is broken per team notes — use the official CLI: https://docs.storacha.network/cli/

CDR SDK supports `@storacha/client` as a storage provider for encrypted files (see [CDR setup](https://docs.story.foundation/developers/cdr-sdk/setup)).

## Prerequisites

- Node.js 18+
- `npm install -g @storacha/cli`

## Setup (one-time)

```bash
storacha --help
storacha space create linestack-vaultline
storacha space ls
```

Register the space with your email when prompted (`storacha space create` flow).

## Upload test file

```bash
storacha up ./sample.csv
```

Note the `storacha.link` gateway URL in the output.

## Line Stack integration

1. **CLI:** `storacha space create linestack-vaultline` (use `--no-recovery --no-caution` for non-interactive).
2. **Server keys:** CI-style delegation (see [Upload from CI](https://docs.storacha.network/how-to/ci/)):

```bash
storacha key create --json
# Save `key` → STORACHA_PRINCIPAL, `did` → AUDIENCE below

storacha delegation create <AUDIENCE-did> \
  -c space/blob/add -c space/index/add -c filecoin/offer -c upload/add --base64
# Save output → STORACHA_PROOF
```

3. **Server:** set both `STORACHA_PRINCIPAL` and `STORACHA_PROOF` in `.env.local` (dev) or Vercel **server** env (prod).
4. **Browser fallback:** paste a CLI proof in **Settings → Storacha** (localStorage only).
5. **API:** `POST /api/storacha/delegation` with `{ "agentDid": "did:key:…" }` returns a 24h upload delegation.

Verify locally: `npx tsx scripts/verify-storacha-delegation.mjs`

Do not commit proof material.
