export type McpTool = {
  name: string;
  product: "core" | "agents" | "ops";
  description: string;
  input: Record<string, string>;
  output: Record<string, string>;
};

export const MCP_TOOLS: McpTool[] = [
  {
    name: "clearance402_status",
    product: "ops",
    description: "Health and configuration for the Clearance402 verification layer.",
    input: {},
    output: { ok: "boolean", registry: "string", version: "string" },
  },
  {
    name: "clearance402_registry_refresh",
    product: "ops",
    description: "Refresh the trust-card registry used by agents and the console.",
    input: {},
    output: { snapshot: "object" },
  },
  {
    name: "clearance402_tool_onboard",
    product: "core",
    description: "Register a paid tool endpoint, price, protocol, and output schema.",
    input: { name: "string", endpoint: "string", protocol: "x402|MCP", price: "string" },
    output: { toolId: "string", state: "ClearanceState" },
  },
  {
    name: "clearance402_tool_probe",
    product: "core",
    description: "Run live protocol, price, output, and reliability checks.",
    input: { toolId: "string" },
    output: { trust: "number", state: "ClearanceState", latencyMs: "number" },
  },
  {
    name: "clearance402_tool_card",
    product: "core",
    description: "Return trust dimensions, clearance badges, and status checks.",
    input: { toolId: "string" },
    output: { trust: "number", dimensions: "object", checks: "object[]" },
  },
  {
    name: "clearance402_agent_register",
    product: "agents",
    description: "Create an agent identity with a spend mandate and approval policy.",
    input: { id: "string", mandateUsd: "number" },
    output: { agentId: "string", mandateUsd: "number" },
  },
  {
    name: "clearance402_check_payment",
    product: "agents",
    description: "Decide whether an agent can pay a tool for a requested amount.",
    input: { agentId: "string", toolId: "string", amount: "string" },
    output: { state: "ClearanceState", reasons: "string[]" },
  },
  {
    name: "clearance402_audit_export",
    product: "ops",
    description: "Export probe, payment, block, approval, and revoke events.",
    input: { kind: "string?", since: "string?" },
    output: { csv: "string", count: "number" },
  },
];
