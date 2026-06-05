#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contractsDir = path.join(root, "contracts", "src");
const outDir = path.join(root, "contracts", "out");
const artifactsDir = path.join(root, "packages", "cdr-core", "src", "contracts", "artifacts");
const soljsonPath = path.join(root, "scripts", "solc-runner", "soljson-v0.8.23.js");
const SOLJSON_URL =
  "https://binaries.soliditylang.org/bin/soljson-v0.8.23+commit.f704f362.js";

async function loadSolc() {
  if (!fs.existsSync(soljsonPath)) {
    console.log("Downloading solc 0.8.23…");
    fs.mkdirSync(path.dirname(soljsonPath), { recursive: true });
    const res = await fetch(SOLJSON_URL);
    if (!res.ok) throw new Error(`solc download failed: ${res.status}`);
    await pipeline(Readable.fromWeb(res.body), createWriteStream(soljsonPath));
  }
  const script = fs.readFileSync(soljsonPath, "utf8");
  const sandbox = { Module: {}, cwrap: null };
  vm.runInNewContext(script, sandbox);
  const compileStandard = sandbox.Module.cwrap("compileStandard", "string", ["string", "string"]);
  return (input, findImports) => {
    const importFn = (imp) => {
      const r = findImports(imp);
      if (r.contents !== undefined) return { contents: r.contents };
      return { error: r.error ?? "not found" };
    };
    return compileStandard(JSON.stringify(input), {
      import: (x) => JSON.stringify(importFn(x)),
    });
  };
}

const sources = {};
function addSource(rel) {
  sources[rel.replace(/\\/g, "/")] = {
    content: fs.readFileSync(path.join(contractsDir, rel), "utf8"),
  };
}

for (const file of fs.readdirSync(path.join(contractsDir, "interfaces"))) {
  if (file.endsWith(".sol")) addSource(`interfaces/${file}`);
}
for (const file of fs.readdirSync(contractsDir)) {
  if (file.endsWith(".sol")) addSource(file);
}

function findImports(importPath) {
  const candidates = [
    path.join(contractsDir, importPath),
    path.join(contractsDir, path.basename(importPath)),
  ];
  for (const full of candidates) {
    if (fs.existsSync(full)) {
      return { contents: fs.readFileSync(full, "utf8") };
    }
  }
  return { error: `File not found: ${importPath}` };
}

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const compile = await loadSolc();
const output = JSON.parse(compile(input, findImports));

if (output.errors?.some((e) => e.severity === "error")) {
  console.error(
    output.errors
      .filter((e) => e.severity === "error")
      .map((e) => e.formattedMessage)
      .join("\n"),
  );
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactsDir, { recursive: true });

const names = [
  "LineStackDatasetRegistry",
  "LineStackTemplateRegistry",
  "LineStackPublisherWriteCondition",
  "LineStackBuyerReadCondition",
  "LineStackMerkleAllowlistReadCondition",
];

for (const name of names) {
  const key = Object.keys(output.contracts).find((k) => k.endsWith(`:${name}`));
  if (!key) {
    console.error(`Missing contract ${name}`, Object.keys(output.contracts));
    process.exit(1);
  }
  const artifact = output.contracts[key][name];
  const payload = {
    contractName: name,
    abi: artifact.abi,
    bytecode: `0x${artifact.evm.bytecode.object}`,
  };
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(payload, null, 2));
  fs.writeFileSync(path.join(artifactsDir, `${name}.json`), JSON.stringify(payload, null, 2));
  console.log(`Wrote ${name}`);
}

console.log("Compile OK");
