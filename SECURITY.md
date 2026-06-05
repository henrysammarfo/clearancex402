# Security

## Secrets

- **Never** commit `WALLET_PRIVATE_KEY`, `IPFS_PROXY_SECRET`, `STORACHA_PROOF`, or `STORACHA_PRINCIPAL`.
- Published npm packages contain **only compiled `dist/`** — no `.env` files.
- CLI, SDK, and MCP read secrets from **your environment** or env files on your machine.

## Recommended env layout

| Location | Use |
|----------|-----|
| `~/.linestack/.env` | Global CLI / MCP (chmod 600 on Unix) |
| `./.env.local` | Per-project (gitignored) |
| `LINESTACK_ENV_FILE` | Explicit path for CI or MCP hosts |

Process env vars already set (e.g. CI secrets) are never overwritten by file loaders.

## MCP hosts

MCP runs locally with your wallet key. Only configure MCP on machines you trust. Do not paste production mainnet keys into chat apps.

## Testnet

Line Stack targets **Story Aeneid testnet (1315)**. Treat testnet keys as disposable; rotate if exposed in chat or logs.

## Report issues

Open a private security report via GitHub Security Advisories on the repository, or contact the maintainers listed in `package.json`.
