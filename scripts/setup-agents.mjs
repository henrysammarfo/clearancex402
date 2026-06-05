#!/usr/bin/env node
/**
 * Copy agent templates into place (MCP example, remind env file).
 * Safe: does not overwrite existing .cursor/mcp.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const home = os.homedir();
const linestackEnv = path.join(home, ".linestack", ".env");
const exampleEnv = path.join(root, ".linestack.env.example");
const mcpExample = path.join(root, ".cursor", "mcp.json.example");
const mcpTarget = path.join(root, ".cursor", "mcp.json");

function copyIfMissing(from, to, label) {
  if (fs.existsSync(to)) {
    console.log(`SKIP  ${label} (already exists): ${to}`);
    return false;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  let text = fs.readFileSync(from, "utf8");
  if (label === "mcp.json" && process.platform === "win32") {
    text = text.replace(
      "C:/Users/YOU/.linestack/.env",
      linestackEnv.replace(/\\/g, "/"),
    );
  }
  fs.writeFileSync(to, text, "utf8");
  console.log(`OK    ${label}: ${to}`);
  return true;
}

console.log("Line Stack — agent setup\n");

if (!fs.existsSync(linestackEnv)) {
  fs.mkdirSync(path.dirname(linestackEnv), { recursive: true });
  fs.copyFileSync(exampleEnv, linestackEnv);
  console.log(`OK    Created ${linestackEnv} — edit secrets before MCP/CLI`);
} else {
  console.log(`SKIP  ${linestackEnv} already exists`);
}

copyIfMissing(mcpExample, mcpTarget, "mcp.json");

console.log(`
Next:
  1. Edit ${linestackEnv}
  2. Reload Cursor → Settings → MCP → linestack should connect
  3. Agent chat: /linestack-agent-setup then /linestack-cdr-demo
  4. Docs: docs/AGENT-INTEGRATIONS.md · Video: docs/DEMO-VIDEO.md
  5. Publish npm: docs/NPM-PUBLISH-COMMANDS.md
`);
