#!/usr/bin/env node
/**
 * One-shot hackathon prep: all automated gates.
 */
import { execSync } from "node:child_process";

const steps = [
  ["smoke", "npm run test:smoke"],
  ["core unit", "npm run test:core"],
  ["CDR integration", "npm run test:core:integration"],
  ["IPFS", "npm run test:ipfs"],
  ["registry", "npm run test:registry"],
  ["beta env", "npm run test:beta-env"],
  ["vercel install", "npm run vercel:check"],
  ["phase3b license", "npm run test:phase3b"],
  ["packages build", "npm run build:packages"],
  ["app build", "npm run build"],
  ["CLI status", "npm run linestack -- status"],
];

let failed = 0;
for (const [name, cmd] of steps) {
  console.log(`\n=== ${name} ===`);
  try {
    execSync(cmd, { stdio: "inherit", env: process.env });
    console.log(`OK ${name}`);
  } catch {
    console.error(`FAIL ${name}`);
    failed++;
  }
}
process.exit(failed ? 1 : 0);
