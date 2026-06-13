#!/usr/bin/env node
/**
 * Clearance402 E2E smoke test — hits all clearance APIs in order.
 * Usage: node scripts/smoke-clearance402.mjs [baseUrl]
 * Env: loads .env.local; uses WALLET_PRIVATE_KEY address as test wallet.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { privateKeyToAccount } from "viem/accounts";

const ROOT = process.cwd();
const BASE = (process.argv[2] ?? process.env.CLEARANCE402_API_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

function loadEnvLocal() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const pk = process.env.WALLET_PRIVATE_KEY?.trim();
if (!pk?.startsWith("0x")) {
  console.error("WALLET_PRIVATE_KEY missing in .env.local — required for smoke test wallet");
  process.exit(1);
}
const WALLET = privateKeyToAccount(pk).address.toLowerCase();

const results = [];
let failed = 0;

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  failed++;
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function api(path, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("x-clearance-wallet", WALLET);
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 300) };
  }
  return { res, data };
}

async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    fail(name, e instanceof Error ? e.message : String(e));
  }
}

console.log(`\nClearance402 smoke test`);
console.log(`Base: ${BASE}`);
console.log(`Wallet: ${WALLET}\n`);

// 0. x402 demo endpoint (Option A — free Base Sepolia)
await step("GET /api/demo/x402 (402 challenge)", async () => {
  const res = await fetch(`${BASE}/api/demo/x402`, { method: "GET" });
  if (res.status !== 402) throw new Error(`expected 402, got ${res.status}`);
  const hasPaymentHeader =
    res.headers.has("payment-required") || res.headers.has("PAYMENT-REQUIRED");
  pass("x402 demo endpoint", `402 challenge · payment header=${hasPaymentHeader}`);
});

// 1. Status
await step("GET /api/clearance/status", async () => {
  const { res, data } = await api("/api/clearance/status", {
    headers: { "x-clearance-wallet": "" },
  });
  if (!res.ok || !data.ok) throw new Error(JSON.stringify(data));
  pass(
    "status",
    `chain=${data.chainId} db=${data.databaseConfigured} venice=${data.veniceConfigured} probe=${data.probeWalletConfigured}`,
  );
});

await step("GET /api/clearance/account", async () => {
  const { res, data } = await api("/api/clearance/account");
  if (!res.ok) throw new Error(data.error ?? res.status);
  pass("account", `audit=${data.audit?.length ?? 0} perms=${data.permissions?.length ?? 0}`);
});

await step("GET /api/clearance/account?dashboard=1", async () => {
  const { res, data } = await api("/api/clearance/account?dashboard=1");
  if (!res.ok || !data.stats) throw new Error(data.error ?? "no stats");
  pass("dashboard", `verified=${data.stats.verifiedTools} probes=${data.stats.activeProbes}`);
});

await step("GET /api/clearance/tools", async () => {
  const { res, data } = await api("/api/clearance/tools");
  if (!res.ok || !Array.isArray(data.tools)) throw new Error(data.error ?? "no tools");
  const hasDemo = data.tools.some((t) => t.id === "x402-sepolia-demo");
  const hasVenice = data.tools.some((t) => t.id === "venice-chat");
  if (!hasDemo || !hasVenice) throw new Error("missing builtin demo or venice tools");
  pass("tools list", `${data.tools.length} tools (demo + venice)`);
});

// Option A — full x402 probe on built-in demo
let probeToolId = "x402-sepolia-demo";
await step("POST /api/clearance/probe (x402-sepolia-demo)", async () => {
  const { res, data } = await api("/api/clearance/probe", {
    method: "POST",
    json: { toolId: probeToolId, pay: true, runVenice: false },
  });
  if (!res.ok) throw new Error(data.error ?? res.status);
  const p = data.probe;
  if (!p) throw new Error("no probe result");
  if (!p.challengeValid && p.httpStatus !== 402) {
    throw new Error(`no 402 challenge http=${p.httpStatus} err=${p.error ?? ""}`);
  }
  if (!p.paymentValid) {
    throw new Error(`x402 pay failed http=${p.httpStatus} err=${p.error ?? ""}`);
  }
  pass("probe demo", `paid=${p.paymentValid} latency=${p.latencyMs}ms`);
});

// Option B — Venice chat probe + eval
await step("POST /api/clearance/probe (venice-chat)", async () => {
  const { res, data } = await api("/api/clearance/probe", {
    method: "POST",
    json: { toolId: "venice-chat", pay: false, runVenice: true },
  });
  if (!res.ok) throw new Error(data.error ?? res.status);
  const p = data.probe;
  if (!p?.responsePreview && !p?.challengeValid) {
    throw new Error("Venice probe produced no output or challenge");
  }
  const evalSource = data.veniceEval?.evalSource ?? "none";
  pass("probe venice", `output=${!!p.responsePreview} eval=${evalSource}`);
});

await step("GET /api/clearance/tools?id=...", async () => {
  const { res, data } = await api(`/api/clearance/tools?id=${encodeURIComponent(probeToolId)}`);
  if (!res.ok || !data.tool) throw new Error(data.error ?? "no tool");
  pass("tool detail", `${data.tool.name} trust=${data.tool.trust} state=${data.tool.state}`);
});

await step("POST /api/clearance/venice-eval", async () => {
  const { res, data } = await api("/api/clearance/venice-eval", {
    method: "POST",
    json: {
      toolId: "venice-chat",
      responsePreview: '{"choices":[{"message":{"content":"cleared"}}]}',
    },
  });
  if (!res.ok) throw new Error(data.error ?? res.status);
  if (!data.evaluation) throw new Error("no evaluation");
  pass(
    "venice-eval",
    `quality=${data.evaluation.qualityScore} source=${data.evaluation.evalSource ?? "venice"}`,
  );
});

let permissionId;
await step("POST /api/clearance/permissions", async () => {
  const { res, data } = await api("/api/clearance/permissions", {
    method: "POST",
    json: {
      userWallet: WALLET,
      agentId: "smoke-buyer-agent",
      maxPerCallUsd: 1,
      dailyLimitUsd: 10,
      allowedDomains: ["venice.ai", "api.venice.ai", "clearancex402.vercel.app"],
      expiryHours: 24,
      permissionContext: "0x" + "ab".repeat(32),
      sessionSmartAccount: "0x" + "cd".repeat(20),
    },
  });
  if (!res.ok || !data.permission) throw new Error(data.error ?? res.status);
  permissionId = data.permission.id;
  pass("permissions grant", permissionId);
});

await step("GET /api/clearance/permissions", async () => {
  const { res, data } = await api("/api/clearance/permissions");
  if (!res.ok || !data.permissions?.length) throw new Error(data.error ?? "empty");
  pass("permissions list", `${data.permissions.length} active`);
});

await step("POST /api/clearance/check", async () => {
  const { res, data } = await api("/api/clearance/check", {
    method: "POST",
    json: {
      agentId: "smoke-buyer-agent",
      toolId: probeToolId,
      amountUsd: 0.001,
      userWallet: WALLET,
    },
  });
  if (!res.ok || !data.decision) throw new Error(data.error ?? res.status);
  pass("check", `${data.decision.state} trust=${data.decision.trust}`);
});

await step("POST /api/clearance/a2a", async () => {
  const { res, data } = await api("/api/clearance/a2a", {
    method: "POST",
    json: {
      query: "demo",
      toolId: probeToolId,
      buyerAgentId: "smoke-buyer-agent",
      userWallet: WALLET,
      skipProbe: true,
    },
  });
  if (!res.ok || !data.trace?.length) throw new Error(data.error ?? "no trace");
  pass("a2a", `${data.trace.length} steps · decision=${data.decision?.state ?? "?"}`);
});

await step("GET /api/clearance/audit", async () => {
  const { res, data } = await api("/api/clearance/audit");
  if (!res.ok || !Array.isArray(data.audit)) throw new Error(data.error ?? res.status);
  pass("audit", `${data.audit.length} events`);
});

const customName = `Smoke Tool ${Date.now()}`;
await step("POST /api/clearance/tools (onboard)", async () => {
  const { res, data } = await api("/api/clearance/tools", {
    method: "POST",
    json: {
      name: customName,
      endpoint: `${BASE}/api/demo/x402`,
      price: "$0.001 USDC / call",
      description: "Smoke test onboard",
      runProbe: false,
      runVenice: false,
    },
  });
  if (!res.ok || !data.tool) throw new Error(data.error ?? res.status);
  pass("onboard", data.tool.id);
});

await step("account persistence", async () => {
  const { res, data } = await api("/api/clearance/account");
  if (!res.ok) throw new Error(data.error ?? res.status);
  const hasProbe = (data.probes ?? []).some((p) => p.toolId === probeToolId);
  const hasPerm = (data.permissions ?? []).some((p) => p.agentId === "smoke-buyer-agent");
  const hasCustom = (data.customTools ?? []).some((t) => t.name === customName);
  if (!hasProbe) throw new Error("probe not in account snapshot");
  if (!hasPerm) throw new Error("permission not in account snapshot");
  if (!hasCustom) throw new Error("custom tool not in account snapshot");
  pass("persistence", "probe + permission + custom tool survived");
});

await step("SDK createClearance402Client", async () => {
  const { createClearance402Client } = await import("@clearance402/sdk");
  const client = createClearance402Client({ baseUrl: BASE, wallet: WALLET });
  const { tools } = await client.listTools();
  if (!tools?.length) throw new Error("SDK listTools empty");
  const demo = await client.probeEndpoint({ toolId: "x402-sepolia-demo", pay: true, runVenice: false });
  if (!demo.probe?.paymentValid) throw new Error("SDK probe pay failed");
  pass("SDK", `${tools.length} tools · demo probe paid`);
});

await step("CLI clearance402 status", async () => {
  const r = spawnSync(
    process.execPath,
    ["packages/clearance402-cli/dist/index.js", "status"],
    {
      cwd: ROOT,
      env: { ...process.env, CLEARANCE402_API_URL: BASE },
      encoding: "utf8",
    },
  );
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || `exit ${r.status}`);
  pass("CLI status", "ok");
});

await step("CLI clearance402 tools list", async () => {
  const r = spawnSync(
    process.execPath,
    ["packages/clearance402-cli/dist/index.js", "tools", "list"],
    {
      cwd: ROOT,
      env: { ...process.env, CLEARANCE402_API_URL: BASE, CLEARANCE402_WALLET: WALLET },
      encoding: "utf8",
    },
  );
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  if (!r.stdout.includes("x402-sepolia-demo")) throw new Error("CLI missing demo tool");
  pass("CLI tools list", "includes x402-sepolia-demo");
});

await step("MCP clearance402_list_tools", async () => {
  const r = spawnSync(
    process.execPath,
    ["scripts/mcp-smoke-once.mjs"],
    {
      cwd: ROOT,
      env: { ...process.env, CLEARANCE402_API_URL: BASE, CLEARANCE402_WALLET: WALLET },
      encoding: "utf8",
    },
  );
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  pass("MCP", r.stdout.trim().split("\n").pop() ?? "ok");
});

await step("POST /api/clearance/session", async () => {
  if (!process.env.SESSION_ENCRYPTION_SECRET?.trim()) {
    pass("session (skipped)", "SESSION_ENCRYPTION_SECRET not set locally");
    return;
  }
  const { res, data } = await api("/api/clearance/session", {
    method: "POST",
    json: {
      userWallet: WALLET,
      agentId: "smoke-session-agent",
      smartAccount: "0x" + "11".repeat(20),
      privateKey: "0x" + "22".repeat(32),
    },
  });
  if (!res.ok) throw new Error(data.error ?? res.status);
  pass("session save", data.agentId ?? "ok");
});

if (permissionId) {
  await step("DELETE /api/clearance/permissions", async () => {
    let lastErr = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { res, data } = await api(`/api/clearance/permissions?id=${encodeURIComponent(permissionId)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(data.error ?? res.status);
        pass("permissions revoke", permissionId);
        return;
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    throw new Error(lastErr);
  });
}

console.log(`\n--- Summary: ${results.filter((r) => r.ok).length}/${results.length} passed, ${failed} failed ---\n`);
if (failed > 0) {
  console.error("Failed steps:");
  for (const r of results.filter((x) => !x.ok)) console.error(`  - ${r.name}: ${r.detail}`);
  process.exit(1);
}
console.log("All smoke tests passed.\n");
