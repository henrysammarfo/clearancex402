# @clearance402/sdk

Wallet-scoped client for the Clearance402 trust layer API.

```bash
npm install @clearance402/sdk
```

```typescript
import { createClearance402Client } from "@clearance402/sdk";

const client = createClearance402Client({
  baseUrl: process.env.CLEARANCE402_API_URL,
  wallet: process.env.CLEARANCE402_WALLET,
});

const { tools } = await client.listTools();
const { probe } = await client.probeEndpoint({ toolId: "x402-sepolia-demo", pay: true });
const { decision } = await client.checkBeforePayment({
  agentId: "buyer-agent",
  toolId: "x402-sepolia-demo",
  amountUsd: 0.001,
});
```

See https://clearancex402.vercel.app/sdk
