import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export type LineStackState = {
  vaults: Array<{
    id: string;
    name: string;
    cdrUuid: string;
    owner: string;
    allocateTxHash: string;
  }>;
  datasets: Array<{
    id: string;
    name: string;
    cdrUuid: string;
    owner: string;
    schemaJson: string;
  }>;
  templates: Array<{
    id: string;
    datasetId: string;
    name: string;
  }>;
  requests: Array<{
    id: string;
    datasetId: string;
    templateId: string;
    buyer: string;
    paramsJson: string;
    status: "pending" | "completed";
    resultCdrUuid?: string;
  }>;
  listings: Array<{
    id: string;
    vaultUuid: string;
    ipId: string;
    licenseTermsId?: string;
  }>;
};

const EMPTY: LineStackState = {
  vaults: [],
  datasets: [],
  templates: [],
  requests: [],
  listings: [],
};

export function defaultStatePath(): string {
  return (
    process.env.LINESTACK_STATE_FILE?.trim() ||
    path.join(os.homedir(), ".linestack", "state.json")
  );
}

export function loadState(filePath = defaultStatePath()): LineStackState {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return structuredClone(EMPTY);
  }
}

export function saveState(state: LineStackState, filePath = defaultStatePath()): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8");
}
