#!/usr/bin/env node
import { createClearance402Client } from "@clearance402/sdk";

const API = process.env.CLEARANCE402_API_URL ?? "https://clearancex402.vercel.app";
const WALLET = process.env.CLEARANCE402_WALLET?.trim();
const client = createClearance402Client({ baseUrl: API, wallet: WALLET });

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = "true";
      }
    } else {
      positional.push(a);
    }
  }
  return { args, positional };
}

function usage() {
  console.log(`clearance402 — trust layer CLI

Usage:
  clearance402 status
  clearance402 account
  clearance402 tools list
  clearance402 tools show <toolId>
  clearance402 tools onboard --name "..." --endpoint URL --price "0.010 USDC"
  clearance402 tools probe <toolId>
  clearance402 clear --agent <id> --tool <toolId> --amount <usd>
  clearance402 pay --agent <id> --tool <toolId> [--execute]
  clearance402 audit [--export file.csv]

Env:
  CLEARANCE402_API_URL   default https://clearancex402.vercel.app
  CLEARANCE402_WALLET    required for account-scoped APIs (0x… address)
`);
}

function requireWallet(): string {
  if (!WALLET || !/^0x[a-f0-9]{40}$/i.test(WALLET)) {
    console.error("Set CLEARANCE402_WALLET=0x… for wallet-scoped commands.");
    process.exit(1);
  }
  return WALLET.toLowerCase();
}

async function main() {
  const { args, positional } = parseArgs(process.argv.slice(2));
  const cmd = positional[0];
  const sub = positional[1];

  if (!cmd || cmd === "help" || cmd === "--help") {
    usage();
    return;
  }

  if (cmd === "status") {
    const s = await client.getStatus();
    console.log(JSON.stringify(s, null, 2));
    return;
  }

  if (cmd === "account") {
    requireWallet();
    const account = await client.getAccount();
    console.log(JSON.stringify(account, null, 2));
    return;
  }

  if (cmd === "tools") {
    requireWallet();
    if (sub === "list" || !sub) {
      const { tools } = await client.listTools();
      for (const t of tools) {
        console.log(`${t.id}\t${t.state}\t${t.trust}\t${t.name}`);
      }
      return;
    }
    if (sub === "show" && positional[2]) {
      const { tool } = await client.getTool(positional[2]);
      console.log(JSON.stringify(tool, null, 2));
      return;
    }
    if (sub === "onboard") {
      const { tool } = await client.onboardTool({
        name: args.name ?? "Custom tool",
        endpoint: args.endpoint ?? "",
        price: args.price ?? "0.010 USDC",
        description: args.description,
        protocol: (args.protocol as "x402" | "MCP") ?? "x402",
        runProbe: args.probe !== "false",
        runVenice: args.venice !== "false",
      });
      console.log(JSON.stringify(tool, null, 2));
      return;
    }
    if (sub === "probe" && positional[2]) {
      const data = await client.probeEndpoint({ toolId: positional[2], pay: true, runVenice: true });
      console.log(JSON.stringify(data, null, 2));
      return;
    }
  }

  if (cmd === "clear") {
    requireWallet();
    const agentId = args.agent;
    const toolId = args.tool;
    const amountUsd = parseFloat(args.amount ?? "0");
    if (!agentId || !toolId || Number.isNaN(amountUsd)) {
      console.error("Usage: clearance402 clear --agent <id> --tool <toolId> --amount <usd>");
      process.exit(1);
    }
    const { decision, toolName } = await client.checkBeforePayment({ agentId, toolId, amountUsd });
    console.log(JSON.stringify({ toolName, decision }, null, 2));
    return;
  }

  if (cmd === "pay") {
    requireWallet();
    const agentId = args.agent;
    const toolId = args.tool;
    if (!agentId || !toolId) {
      console.error("Usage: clearance402 pay --agent <id> --tool <toolId> [--execute]");
      process.exit(1);
    }
    const result = await client.payIfCleared({
      agentId,
      toolId,
      amountUsd: parseFloat(args.amount ?? "0.01"),
      execute: args.execute === "true",
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (cmd === "audit") {
    requireWallet();
    const data = await client.getAuditLog();
    if (args.export) {
      const header = ["time", "kind", "tool", "actor", "detail"];
      const lines = data.audit.map((e) =>
        [e.time, e.kind, e.tool, e.actor, e.detail].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      );
      const fs = await import("node:fs/promises");
      await fs.writeFile(args.export, [header.join(","), ...lines].join("\n"), "utf8");
      console.log(`Exported ${data.audit.length} events to ${args.export}`);
      return;
    }
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  usage();
  process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
