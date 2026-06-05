import type { PublicClient, WalletClient } from "viem";
import {
  computeTemplateId,
  fetchOnChainDatasets,
  fetchOnChainTemplates,
  lineStackContractsConfigured,
  loadLineStackContracts,
  registerDatasetOnChain,
  registerTemplateOnChain,
  type LineStackDeployedContracts,
} from "@line-stack/cdr-core";
import type { DatasetRecord, QueryTemplateRecord } from "@/lib/queryline/registry";

export {
  computeTemplateId,
  fetchOnChainDatasets,
  fetchOnChainTemplates,
  registerDatasetOnChain,
  registerTemplateOnChain,
};

export function getContracts(): LineStackDeployedContracts | null {
  return loadLineStackContracts();
}

export function contractsReady(): boolean {
  return lineStackContractsConfigured();
}

import { lineStackTemplateRegistryAbi } from "@line-stack/cdr-core";

export async function isTemplateActiveOnChain(
  publicClient: PublicClient,
  templateId: `0x${string}`,
): Promise<boolean> {
  const c = getContracts();
  if (!c) return false;
  const result = await publicClient.readContract({
    address: c.templateRegistry,
    abi: lineStackTemplateRegistryAbi,
    functionName: "getTemplate",
    args: [templateId],
  });
  return result[4];
}
