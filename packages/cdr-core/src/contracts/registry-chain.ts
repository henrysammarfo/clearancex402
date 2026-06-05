import type { PublicClient, WalletClient } from "viem";
import { computeTemplateId } from "./template-id.js";
import {
  lineStackDatasetRegistryAbi,
  lineStackTemplateRegistryAbi,
} from "./abis.js";
import { loadLineStackContracts } from "./addresses.js";
import type { RegistryDatasetRecord, RegistryTemplateRecord } from "../registry/types.js";

export async function registerDatasetOnChain(
  walletClient: WalletClient,
  publicClient: PublicClient,
  params: { cdrUuid: number; name: string; schemaJson: string },
): Promise<{ txHash: `0x${string}` }> {
  const c = loadLineStackContracts();
  if (!c) throw new Error("Line Stack contracts not configured (set LINESTACK_* env).");
  const hash = await walletClient.writeContract({
    address: c.datasetRegistry,
    abi: lineStackDatasetRegistryAbi,
    functionName: "registerDataset",
    args: [params.cdrUuid, params.name, params.schemaJson],
    chain: walletClient.chain,
    account: walletClient.account!,
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash };
}

export async function registerTemplateOnChain(
  walletClient: WalletClient,
  publicClient: PublicClient,
  params: { datasetCdrUuid: number; name: string; paramsSchemaJson: string },
): Promise<{ txHash: `0x${string}`; templateId: `0x${string}` }> {
  const c = loadLineStackContracts();
  if (!c) throw new Error("Line Stack contracts not configured.");
  const publisher = walletClient.account!.address as `0x${string}`;
  const templateId = computeTemplateId(params.datasetCdrUuid, params.name, publisher);
  const hash = await walletClient.writeContract({
    address: c.templateRegistry,
    abi: lineStackTemplateRegistryAbi,
    functionName: "registerTemplate",
    args: [params.datasetCdrUuid, params.name, params.paramsSchemaJson],
    chain: walletClient.chain,
    account: walletClient.account!,
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash, templateId };
}

export async function fetchOnChainDatasets(
  publicClient: PublicClient,
  fromBlock: bigint = 0n,
): Promise<RegistryDatasetRecord[]> {
  const c = loadLineStackContracts();
  if (!c) return [];

  const logs = await publicClient.getContractEvents({
    address: c.datasetRegistry,
    abi: lineStackDatasetRegistryAbi,
    eventName: "DatasetRegistered",
    fromBlock,
    toBlock: "latest",
  });

  return logs.map((log) => {
    const args = log.args;
    return {
      id: `chain-${args.cdrUuid ?? 0}`,
      name: args.name ?? "",
      description: "",
      schemaJson: args.schemaJson ?? "{}",
      cdrUuid: String(args.cdrUuid ?? 0),
      owner: args.owner ?? "0x0000000000000000000000000000000000000000",
      allocateTxHash: "—",
      createdAt: new Date().toISOString(),
    };
  });
}

export async function fetchOnChainTemplates(
  publicClient: PublicClient,
  fromBlock: bigint = 0n,
): Promise<RegistryTemplateRecord[]> {
  const c = loadLineStackContracts();
  if (!c) return [];

  const logs = await publicClient.getContractEvents({
    address: c.templateRegistry,
    abi: lineStackTemplateRegistryAbi,
    eventName: "TemplateRegistered",
    fromBlock,
    toBlock: "latest",
  });

  return logs.map((log) => {
    const args = log.args;
    return {
      id: args.templateId ?? "0x",
      datasetId: `chain-${args.datasetCdrUuid ?? 0}`,
      name: args.name ?? "",
      description: "",
      paramsSchemaJson: args.paramsSchemaJson ?? "{}",
      createdAt: new Date().toISOString(),
    };
  });
}
