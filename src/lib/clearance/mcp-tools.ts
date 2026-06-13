export type McpTool = {
  name: string;
  description: string;
  input: Record<string, string>;
  output: Record<string, string>;
};

export const MCP_TOOLS: McpTool[] = [
  {
    name: "clearance402_status",
    description: "Health: chain, probe wallet, Venice API configuration.",
    input: {},
    output: { ok: "boolean", chainId: "number", probeWalletConfigured: "boolean" },
  },
  {
    name: "clearance402_list_tools",
    description: "List registry tools with live trust scores from probes.",
    input: {},
    output: { tools: "EnrichedTool[]" },
  },
  {
    name: "clearance402_get_tool",
    description: "Trust card for one tool — scores, checks, last probe.",
    input: { toolId: "string" },
    output: { tool: "EnrichedTool" },
  },
  {
    name: "clearance402_onboard_tool",
    description: "Register endpoint + run live probe and Venice eval.",
    input: { name: "string", endpoint: "string", price: "string" },
    output: { tool: "EnrichedTool", probe: "ProbeResult" },
  },
  {
    name: "clearance402_probe_endpoint",
    description: "402 challenge → x402 pay → response on Base Sepolia.",
    input: { toolId: "string" },
    output: { probe: "ProbeResult", veniceEval: "object" },
  },
  {
    name: "clearance402_check_payment",
    description: "ALLOW / WARN / BLOCK / RETEST / HUMAN_APPROVAL_REQUIRED.",
    input: { agentId: "string", toolId: "string", amountUsd: "number" },
    output: { decision: "CheckDecision", toolName: "string" },
  },
  {
    name: "clearance402_record_payment",
    description: "Record browser pay-if-cleared with x402 payment proof.",
    input: { agentId: "string", toolId: "string", paymentProof: "string", httpStatus: "number" },
    output: { ok: "boolean", amountUsd: "number" },
  },
  {
    name: "clearance402_get_audit_log",
    description: "Probes, payments, blocks, permissions, A2A events.",
    input: {},
    output: { audit: "AuditEvent[]" },
  },
];

export const MCP_CONFIG = `{
  "mcpServers": {
    "clearance402": {
      "command": "npx",
      "args": ["-y", "@clearance402/mcp-server"],
      "env": {
        "CLEARANCE402_API_URL": "http://localhost:8080"
      }
    }
  }
}`;
