# @line-stack/cli

Terminal interface for **Vaultline** and **Queryline** on Story Aeneid (CDR).

## Install

```bash
npm install -g @line-stack/cli
```

## Configure

Create `~/.linestack/.env` (recommended, restrict permissions on Unix):

```env
WALLET_PRIVATE_KEY=0x...
STORY_RPC_URL=https://aeneid.storyrpc.io
IPFS_PROXY_URL=http://your-host:8787
IPFS_PROXY_SECRET=your-secret
```

Or use `./.env.local` in your project, or `LINESTACK_ENV_FILE=/path/to/.env`.

## Usage

```bash
linestack status
linestack vaultline create-vault --name demo
linestack queryline create-dataset --name patients
```

- CLI reference: [docs/SDK-CLI-MCP.md](https://github.com/henrysammarfo/linestack/blob/main/docs/SDK-CLI-MCP.md)
- All agents (Cursor, Claude, ChatGPT, Gemini): [docs/AGENT-INTEGRATIONS.md](https://github.com/henrysammarfo/linestack/blob/main/docs/AGENT-INTEGRATIONS.md)

## Security

Secrets stay on your machine. See [SECURITY.md](https://github.com/henrysammarfo/linestack/blob/main/SECURITY.md).
