#!/usr/bin/env node
/**
 * One-shot MCP smoke: list tools via stdio MCP server.
 */
import { spawn } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
const API = process.env.CLEARANCE402_API_URL ?? "http://localhost:3000";
const WALLET = process.env.CLEARANCE402_WALLET ?? "";

const mcpPath = join(ROOT, "packages/clearance402-mcp/dist/index.js");
const proc = spawn(process.execPath, [mcpPath], {
  env: { ...process.env, CLEARANCE402_API_URL: API, CLEARANCE402_WALLET: WALLET },
  stdio: ["pipe", "pipe", "pipe"],
});

function send(msg) {
  proc.stdin.write(JSON.stringify(msg) + "\n");
}

let initialized = false;
let done = false;

proc.stdout.on("data", (chunk) => {
  for (const line of chunk.toString().split("\n")) {
    if (!line.trim()) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.id === 1 && msg.result) {
      initialized = true;
      send({ jsonrpc: "2.0", method: "notifications/initialized" });
      send({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "clearance402_list_tools", arguments: {} },
      });
    }
    if (msg.id === 2) {
      const text = msg.result?.content?.[0]?.text ?? "";
      const data = JSON.parse(text);
      if (!data.tools?.some((t) => t.id === "x402-sepolia-demo")) {
        console.error("MCP list_tools missing x402-sepolia-demo");
        process.exit(1);
      }
      console.log(`MCP list_tools ok (${data.tools.length} tools)`);
      done = true;
      proc.kill();
    }
    if (msg.error) {
      console.error("MCP error:", msg.error);
      process.exit(1);
    }
  }
});

proc.stderr.on("data", (d) => process.stderr.write(d));
proc.on("exit", (code) => {
  if (!done) process.exit(code ?? 1);
});

send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "smoke", version: "0.1.0" },
  },
});

setTimeout(() => {
  if (!done) {
    console.error(`MCP smoke timeout (initialized=${initialized})`);
    proc.kill();
    process.exit(1);
  }
}, 20000);
