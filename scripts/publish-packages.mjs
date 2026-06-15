#!/usr/bin/env node
import { execSync } from "node:child_process";

function npmWhoami() {
  try {
    return execSync("npm whoami", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

const ORDER = ["@clearance402/sdk", "@clearance402/cli", "@clearance402/mcp-server"];

const dryRun = process.argv.includes("--dry-run");

console.log("Building packages…");
execSync("npm run build:packages", { stdio: "inherit" });

console.log("Verifying packages…");
for (const dir of ["clearance402-sdk", "clearance402-cli", "clearance402-mcp"]) {
  execSync(`node scripts/verify-npm-package.mjs packages/${dir}`, { stdio: "inherit" });
}

if (!dryRun) {
  const user = npmWhoami();
  if (!user) {
    console.error(
      "\nFAIL  Not logged in to npm (npm whoami failed).\n" +
        "  Run: npm login\n" +
        "  Or set NODE_AUTH_TOKEN for CI / one-shot publish.\n" +
        "  Confirm you own org @clearance402 (https://www.npmjs.com/settings/clearance402/packages).\n",
    );
    process.exit(1);
  }
  console.log(`\nPublishing as npm user: ${user}`);
}

const flag = dryRun ? " --dry-run" : "";
for (const name of ORDER) {
  console.log(`\nPublishing ${name}${dryRun ? " (dry-run)" : ""}…`);
  execSync(`npm publish -w ${name} --access public${flag}`, { stdio: "inherit" });
}

console.log(dryRun ? "\nDry-run complete." : "\nAll packages published.");
