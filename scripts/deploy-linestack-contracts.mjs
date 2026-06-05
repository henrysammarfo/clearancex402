#!/usr/bin/env node
/**
 * Deploy Line Stack contracts to Story Aeneid.
 * Requires: WALLET_PRIVATE_KEY, STORY_RPC_URL (or default), compiled contracts/out/*.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  createWalletClient,
  http,
  encodeDeployData,
  getContractAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const root = process.env.LINESTACK_ROOT
  ? path.resolve(process.env.LINESTACK_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "contracts", "out");
const deployedPath = path.join(root, "contracts", "deployed.aeneid.json");

function loadEnvFile(filePath) {
  try {
    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq <= 0) continue;
      const k = t.slice(0, eq).trim();
      if (process.env[k] === undefined) process.env[k] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // ignore
  }
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const pk = process.env.WALLET_PRIVATE_KEY;
if (!pk?.startsWith("0x")) {
  console.error("Set WALLET_PRIVATE_KEY in .env.local");
  process.exit(1);
}

const rpc = process.env.STORY_RPC_URL ?? "https://aeneid.storyrpc.io";
const account = privateKeyToAccount(pk);
const chain = {
  id: 1315,
  name: "Story Aeneid",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: { default: { http: [rpc] } },
};

const publicClient = createPublicClient({ chain, transport: http(rpc) });
const walletClient = createWalletClient({ account, chain, transport: http(rpc) });

function loadArtifact(name) {
  return JSON.parse(fs.readFileSync(path.join(outDir, `${name}.json`), "utf8"));
}

async function deploy(name, constructorArgs = []) {
  const { abi, bytecode } = loadArtifact(name);
  const data = encodeDeployData({ abi, bytecode, args: constructorArgs });
  const hash = await walletClient.sendTransaction({ data });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.contractAddress === null) throw new Error(`${name} deploy failed`);
  console.log(`${name}: ${receipt.contractAddress} (${hash})`);
  return receipt.contractAddress;
}

async function main() {
  if (!fs.existsSync(path.join(outDir, "LineStackDatasetRegistry.json"))) {
    console.error("Run: node scripts/compile-linestack-contracts.mjs");
    process.exit(1);
  }

  const datasetRegistry = await deploy("LineStackDatasetRegistry");
  const templateRegistry = await deploy("LineStackTemplateRegistry", [datasetRegistry]);
  const publisherWrite = await deploy("LineStackPublisherWriteCondition");
  const buyerRead = await deploy("LineStackBuyerReadCondition");
  const merkleAllowlist = await deploy("LineStackMerkleAllowlistReadCondition");

  const deployed = {
    chainId: 1315,
    deployedAt: new Date().toISOString(),
    deployer: account.address,
    datasetRegistry,
    templateRegistry,
    publisherWriteCondition: publisherWrite,
    buyerReadCondition: buyerRead,
    merkleAllowlistReadCondition: merkleAllowlist,
  };

  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2));
  console.log(`\nWrote ${deployedPath}`);
  console.log("\nAdd to .env.local:");
  console.log(`VITE_LINESTACK_DATASET_REGISTRY=${datasetRegistry}`);
  console.log(`VITE_LINESTACK_TEMPLATE_REGISTRY=${templateRegistry}`);
  console.log(`LINESTACK_DATASET_REGISTRY=${datasetRegistry}`);
  console.log(`LINESTACK_TEMPLATE_REGISTRY=${templateRegistry}`);
  console.log(`LINESTACK_PUBLISHER_WRITE_CONDITION=${publisherWrite}`);
  console.log(`LINESTACK_BUYER_READ_CONDITION=${buyerRead}`);
  console.log(`LINESTACK_MERKLE_ALLOWLIST_READ_CONDITION=${merkleAllowlist}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
