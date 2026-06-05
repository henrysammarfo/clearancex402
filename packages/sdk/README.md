# @line-stack/sdk

Node.js SDK for **Vaultline** and **Queryline** on Story Aeneid (CDR). Wraps `@line-stack/cdr-core` with file-backed local state for CLI and MCP.

## Install

```bash
npm install @line-stack/sdk
```

## Setup

```bash
# Monorepo dev
npm run build:core && npm run build:sdk
```

Environment (same as the web app for CDR):

- `WALLET_PRIVATE_KEY` — required for SDK/CLI/MCP
- `STORY_RPC_URL`, `STORY_API_URL` — optional (Aeneid defaults)
- `IPFS_PROXY_URL` + `IPFS_PROXY_SECRET` — for encrypted file upload/unlock

- `loadLineStackEnv()` — loads `LINESTACK_ENV_FILE`, cwd `.env.local`, or `~/.linestack/.env`
- `LINESTACK_STATE_FILE` (default `~/.linestack/state.json`)

## Example

```ts
import { LineStack } from "@line-stack/sdk";

const ls = new LineStack();
await ls.connect();

const { vaultId, cdrUuid, txHash } = await ls.vaultlineCreateVault("demo");
await ls.vaultlineWriteSecret(cdrUuid, JSON.stringify({ hello: true }));

const { datasetId } = await ls.querylineCreateDataset("patients");
await ls.querylineSeedDataset(datasetId, {
  rows: [{ region: "EU", value: 10 }, { region: "US", value: 20 }],
});
const { templateId } = await ls.querylineAddTemplate(datasetId, "avg_value_by_region");
const { requestId } = await ls.querylineRequestQuery(datasetId, templateId, { region: "EU" });
// Publisher wallet:
await ls.querylineFulfillRequest(requestId);
// Buyer wallet (same key if testing solo):
const { data } = await ls.querylineUnlockResult(requestId);
```

## Queryline model

CDR SDK 0.2.1 has no enclave `executeQuery`. Fulfillment is **publisher-side**: decrypt dataset vault → run allow-listed template → write result vault. Buyers only unlock the result vault.

## Agents

MCP and CLI mirror this SDK. Setup: [docs/AGENT-INTEGRATIONS.md](https://github.com/henrysammarfo/linestack/blob/main/docs/AGENT-INTEGRATIONS.md).
