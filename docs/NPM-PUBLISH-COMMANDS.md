# npm publish — commands to run (maintainer)

**Do not paste npm tokens in chat or commit them.** Run on your machine after `npm login` and creating org **@line-stack**.

---

## One-time: npm org + login

```powershell
cd path\to\linestack

npm login
# Browser + 2FA — you complete this locally

# Create org at https://www.npmjs.com/org/create → name: line-stack (scope @line-stack)
# Add your user as owner
```

---

## Pre-publish verify

```powershell
cd path\to\linestack

npm run build:packages
npm run verify:publish
npm run publish:packages:dry-run
```

All four packages must print `OK @line-stack/...`.

---

## Publish (production)

```powershell
cd path\to\linestack

npm run publish:packages
```

Order (automatic): `@line-stack/cdr-core` → `@line-stack/sdk` → `@line-stack/cli` → `@line-stack/mcp-server`.

---

## Confirm on registry

```powershell
npm view @line-stack/cdr-core version
npm view @line-stack/sdk version
npm view @line-stack/cli version
npm view @line-stack/mcp-server version

npx -y @line-stack/mcp-server
# Ctrl+C to exit after it starts (stdio server)

npm install -g @line-stack/cli
linestack status
```

---

## After publish — update MCP config to npx

Use [docs/config/cursor-mcp.json](./config/cursor-mcp.json) with:

```json
"command": "npx",
"args": ["-y", "@line-stack/mcp-server"]
```

Commit example configs only — never secrets in git.

---

## If publish fails

| Error | Fix |
|-------|-----|
| **404 Not Found** on `@line-stack/...` | Almost always **not logged in** — run `npm login` and `npm whoami`. You must be owner of org **@line-stack**. |
| 402 / paywall | Enable npm public publishing on account |
| 403 scope | Org `@line-stack` must own package names |
| Version already exists | Bump all four `package.json` versions together (e.g. `0.1.2`) |
| OTP / 2FA | Run `npm login` again; use automation token only in CI, not chat |

See also [PUBLISHING.md](./PUBLISHING.md).
