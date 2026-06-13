#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE = (process.env.CLEARANCE402_API_URL ?? "https://clearancex402.vercel.app").replace(
  /\/$/,
  "",
);
const WALLET = process.env.CLEARANCE402_WALLET?.trim()?.toLowerCase();

async function api(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (WALLET) headers.set("x-clearance-wallet", WALLET);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? `API ${res.status}`);
  return data;
}

const server = new Server(
  { name: "clearance402", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "clearance402_status",
      description: "Health and configuration (chain, probe wallet, Venice API).",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "clearance402_get_account",
      description: "Full wallet account snapshot (audit, permissions, probes). Requires CLEARANCE402_WALLET.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "clearance402_list_tools",
      description: "List all tools with live trust scores from probes.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "clearance402_get_tool",
      description: "Fetch a trust card for one tool (live scores + checks).",
      inputSchema: {
        type: "object",
        properties: { toolId: { type: "string" } },
        required: ["toolId"],
      },
    },
    {
      name: "clearance402_onboard_tool",
      description: "Register an x402 endpoint and run live probe + Venice eval.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          endpoint: { type: "string" },
          price: { type: "string" },
          description: { type: "string" },
        },
        required: ["name", "endpoint", "price"],
      },
    },
    {
      name: "clearance402_probe_endpoint",
      description: "Run live x402 probe (402 → pay → response) on Base Sepolia.",
      inputSchema: {
        type: "object",
        properties: {
          toolId: { type: "string" },
          endpoint: { type: "string" },
        },
        required: ["toolId"],
      },
    },
    {
      name: "clearance402_check_payment",
      description: "Check whether an agent may pay (ALLOW/WARN/BLOCK/…).",
      inputSchema: {
        type: "object",
        properties: {
          agentId: { type: "string" },
          toolId: { type: "string" },
          amountUsd: { type: "number" },
          userWallet: { type: "string" },
        },
        required: ["agentId", "toolId", "amountUsd"],
      },
    },
    {
      name: "clearance402_record_payment",
      description: "Record or execute pay-if-cleared (set execute:true for server-side x402).",
      inputSchema: {
        type: "object",
        properties: {
          agentId: { type: "string" },
          toolId: { type: "string" },
          execute: { type: "boolean" },
          paymentProof: { type: "string" },
          httpStatus: { type: "number" },
          userWallet: { type: "string" },
          permissionId: { type: "string" },
        },
        required: ["agentId", "toolId"],
      },
    },
    {
      name: "clearance402_get_audit_log",
      description: "Fetch recent audit events.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  const a = (args ?? {}) as Record<string, unknown>;

  if (name === "clearance402_status") {
    const data = await api("/api/clearance/status");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "clearance402_get_account") {
    const data = await api("/api/clearance/account");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "clearance402_list_tools") {
    const data = await api("/api/clearance/tools");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "clearance402_get_tool") {
    const data = await api(`/api/clearance/tools?id=${encodeURIComponent(String(a.toolId))}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "clearance402_onboard_tool") {
    const data = await api("/api/clearance/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: a.name,
        endpoint: a.endpoint,
        price: a.price,
        description: a.description,
        runProbe: true,
        runVenice: true,
      }),
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "clearance402_probe_endpoint") {
    const data = await api("/api/clearance/probe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toolId: a.toolId,
        endpoint: a.endpoint,
        pay: true,
        runVenice: true,
      }),
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "clearance402_check_payment") {
    const data = await api("/api/clearance/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: a.agentId,
        toolId: a.toolId,
        amountUsd: a.amountUsd,
        userWallet: a.userWallet,
      }),
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "clearance402_record_payment") {
    const data = await api("/api/clearance/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: a.agentId,
        toolId: a.toolId,
        execute: a.execute,
        paymentProof: a.paymentProof,
        httpStatus: a.httpStatus,
        userWallet: a.userWallet,
        permissionId: a.permissionId,
      }),
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "clearance402_get_audit_log") {
    const data = await api("/api/clearance/audit");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
