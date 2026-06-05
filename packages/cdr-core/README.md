# @line-stack/cdr-core

Production-oriented wrapper around [`@piplabs/cdr-sdk`](https://www.npmjs.com/package/@piplabs/cdr-sdk) v0.2.1 for Story **Aeneid** testnet.

## Verified configuration

- RPC: `https://aeneid.storyrpc.io` (chain ID `1315`)
- Story-API REST: `http://172.192.41.96:1317` (required `apiUrl` for DKG reads)

See [Story CDR setup](https://docs.story.foundation/developers/cdr-sdk/setup).

## Usage

```typescript
import { createLineStackCdrClient, initLineStackCdr, loadConfigFromEnv } from "@line-stack/cdr-core";

const config = loadConfigFromEnv();
await initLineStackCdr();

const { client, publicClient } = createLineStackCdrClient({ config });
const fee = await client.observer.getAllocateFee();
```

## Tests

```bash
bun run test          # unit only
RUN_CDR_INTEGRATION=1 WALLET_PRIVATE_KEY=0x... bun run test:integration
```

Integration tests send real Aeneid transactions and cost testnet gas.
