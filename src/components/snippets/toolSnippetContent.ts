import type { McpTool } from "@/components/mcp/toolRegistry";

/** Clearance402 copy-paste snippets for SDK, CLI, and MCP hosts. */
export function snippetBodies(tool: McpTool): { sdk: string; cli: string; mcp: string } {
  const mcpArgs = JSON.stringify(
    Object.fromEntries(Object.keys(tool.input).map((k) => [k, `<${tool.input[k]}>`])),
    null,
    2,
  );

  const mcp = `// MCP tool: ${tool.name}\n${mcpArgs}`;

  const bodies: Record<string, { sdk: string; cli: string }> = {
    clearance402_status: { sdk: `await c402.status();`, cli: `clearance402 status` },
    clearance402_registry_refresh: { sdk: `await c402.refreshRegistry();`, cli: `clearance402 registry refresh` },
    clearance402_tool_onboard: {
      sdk: `await c402.onboardTool({ name: "Weather API", endpoint: "https://api.example.com/x402", protocol: "x402", price: "0.010 USDC" });`,
      cli: `clearance402 tools onboard --name "Weather API" --endpoint https://api.example.com/x402 --protocol x402 --price "0.010 USDC"`,
    },
    clearance402_tool_probe: { sdk: `await c402.probeTool("weather-api");`, cli: `clearance402 tools probe weather-api` },
    clearance402_tool_card: { sdk: `await c402.getTrustCard("weather-api");`, cli: `clearance402 tools show weather-api` },
    clearance402_agent_register: { sdk: `await c402.registerAgent({ id: "buyer-agent", mandateUsd: 5 });`, cli: `clearance402 agents register --id buyer-agent --mandate 5.00` },
    clearance402_check_payment: { sdk: `await c402.checkBeforePayment({ agentId: "buyer-agent", toolId: "weather-api", amount: "0.010 USDC" });`, cli: `clearance402 clear --agent buyer-agent --tool weather-api --amount "0.010 USDC"` },
    clearance402_audit_export: { sdk: `await c402.exportAudit({ kind: "PAYMENT" });`, cli: `clearance402 audit --kind PAYMENT --export audit.csv` },
  };

  const hit = bodies[tool.name];
  const sdkPrefix =
    tool.name === "clearance402_status" || tool.name === "clearance402_registry_refresh"
      ? ""
      : `import { Clearance402 } from "@clearance402/sdk";\nconst c402 = new Clearance402({ apiKey: process.env.CLEARANCE402_API_KEY });\n`;

  return {
    sdk: hit ? sdkPrefix + hit.sdk : `${sdkPrefix}// See /docs — ${tool.name}`,
    cli: hit?.cli ?? `clearance402 /* see docs */`,
    mcp,
  };
}
